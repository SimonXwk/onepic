from flask import current_app
import pyodbc
import os
import datetime
from app.cache import cached
from app.helper import jsonified, timeit


class ODBCResult(object):
	def __init__(self, data, cached_timeout):
		self.headers, self.types, self.rows, self.bytes, self.timestamp = data
		self.cached_timeout = cached_timeout

	def __str__(self):
		return f'>> Timestamp : {self.timestamp}' \
				f'\n>> Rows : {len(self.rows):,}' \
				f'\n>> Size : {self.bytes:,} bytes' \
				f'\n>> Columns : {self.headers}' \
				f'\n>> Types : {self.types!r}' \
				f'\n>> First Row : {self.rows[0]}'

	def to_dict(self, rows):
		return dict(rows=rows, headers=self.headers, bytes=self.bytes, timestamp=self.timestamp, cached_timeout=self.cached_timeout)

	def reshape_rows(self, orient='records'):
		if orient == 'records':
			results = []
			for row in self.rows:
				results.append(dict(zip(self.headers, row)))
			return results

		elif orient == 'columns':
			results = {}
			# Each Column is a dictionary key
			for col in self.headers:
				results[col] = []
			# Filling data for each key as a list
			for row in self.rows:
				for col in range(len(self.headers)):
					results[self.headers[col]].append(row[col])
			return results

	@jsonified
	def to_json(self, orient='records'):
		return self.to_dict(self.reshape_rows(orient=orient))


class ThankqODBC(object):
	__connection_string_report_live = current_app.config.get('TQ_REPORTL_CONNECTION_STRING')
	__connection_string_report_rep = current_app.config.get('TQ_REPORTR_CONNECTION_STRING')
	__script_folder = os.path.join(current_app.root_path, 'database\scripts')
	default_cache_timeout = 120

	@classmethod
	def format_date(cls, value, fmt='%Y/%m/%d'):
		if isinstance(value, tuple):
			return tuple(v.strftime(fmt) for v in value)
		elif isinstance(value, list):
			return [v.strftime(fmt) for v in value]
		return value.strftime(fmt)

	@classmethod
	def __get_script(cls, file_name):
		sql_file = os.path.join(cls.__script_folder, file_name if file_name[-4:] == '.sql' else file_name + '.sql')
		# flask.open_resource use open(os.path.join(self.root_path, resource), mode) as return value
		# therefore strip leading/tailing slashes for the sake of os.path.join(..., ...)
		with current_app.open_resource(sql_file, 'r') as f:
			script = " ".join(f.readlines())
		return script

	@classmethod
	def __merge_script(cls, file_list):
		output = ''
		for file in file_list:
			output = output + " \n" + cls.__get_script(file)
		return output

	@classmethod
	@timeit
	def query(cls, file_names, *parameters, use_live=True, cached_timeout=default_cache_timeout, updates=None):
		if isinstance(file_names, list) or isinstance(file_names, tuple):
			script = cls.__merge_script(file_names)
		else:
			script = cls.__get_script(file_names)

		if updates:
			script = cls.__change_parameter(script, updates)

		@cached(cached_timeout)
		def run(conn_str, sql, *params):
			with pyodbc.connect(conn_str) as conn:
				cursor = conn.cursor()  # Create a cursor from the connection
				# If there are no rows: fetchall() and fetchmany() will both return empty list of row objects.
				# Row objects are similar to tuples, but they also allow access to columns by name: row[1]/row.colname

				rows = cursor.execute(sql, *params).fetchall()  # A List
				headers = [column[0] for column in cursor.description]
				types = [column[1] for column in cursor.description]
				byte_size = sum([column[3] for column in cursor.description])
				# stamp = cursor.execute('SELECT CURRENT_TIMESTAMP').fetchone()[0]  # A Tuple
				timestamp = datetime.datetime.now()
				return headers, types, rows, byte_size, timestamp  # returning a comma separated set of elements creates a tuple

		return ODBCResult(run(cls.__connection_string_report_live if use_live else cls.__connection_string_report_rep, script, *parameters), cached_timeout)

	@classmethod
	def __change_parameter(cls, script, update_list):
		for item in update_list:
			tag, value = item[0], item[1]

			if len(item) == 3:
				wrapper_left = wrapper_right = item[2]
			elif len(item) == 4:
				wrapper_left, wrapper_right = item[2], item[3]
			else:
				wrapper_left = wrapper_right = ''

			opening_tag, closing_tag = f'/*<{tag}>*/', f'/*</{tag}>*/'

			try:
				start = script.index(opening_tag) + len(opening_tag)
				end = script.index(closing_tag, start)
			except ValueError:
				return script

			old_value = f'{opening_tag}{script[start:end]}{closing_tag}'
			new_value = f'{opening_tag}{wrapper_left}{value}{wrapper_right}{closing_tag}'

			script = script.replace(old_value, new_value)
		print(f'> {len(update_list)} parameter replaced')
		return script
