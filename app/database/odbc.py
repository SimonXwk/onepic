from flask import current_app
import pyodbc
import os
import datetime
from app.cache import cached


class ODBCResult:
	def __init__(self, data, cached_timeout):
		self.headers, self.rows = data
		self.cached_timeout = cached_timeout
		self.timestamp = datetime.datetime.now()

	def __str__(self):
		return 'data retrieved at {} :\n{}'.format(self.timestamp, self.rows)


class ThankqODBC:
	connection_string = current_app.config.get('TQ_PRT1_CONNECTION_STRING')
	script_folder = os.path.join(current_app.root_path, 'database\scripts')

	@classmethod
	def format_date(cls, value, fmt='%Y/%m/%d'):
		return value.strftime(fmt)

	@classmethod
	def get_script(cls, file_name):
		sql_file = os.path.join(cls.script_folder, file_name if file_name[-4:] == '.sql' else file_name + '.sql')
		# flask.open_resource use open(os.path.join(self.root_path, resource), mode) as return value
		# therefore strip leading/tailing slashes for the sake of os.path.join(..., ...)
		with current_app.open_resource(sql_file, 'r') as f:
			script = " ".join(f.readlines())
		return script

	@classmethod
	def query(cls, file_name, *parameters, cached_timeout=120, updates=None):
		script = cls.get_script(file_name)

		if updates:
			script = cls.change_parameter(script, updates)

		@cached(cached_timeout)
		def run(conn_str, sql, *params):
			with pyodbc.connect(conn_str) as conn:
				cursor = conn.cursor()  # Create a cursor from the connection
				# If there are no rows: fetchall() and fetchmany() will both return empty list of row objects.
				# Row objects are similar to tuples, but they also allow access to columns by name: row[1]/row.colname
				rows = cursor.execute(sql, *params).fetchall()  # A List
				headers = [column[0] for column in cursor.description]
				# stamp = cursor.execute('SELECT CURRENT_TIMESTAMP').fetchone()[0]  # A Tuple
				return headers, rows  # returning a comma separated set of elements creates a tuple
		return ODBCResult(run(cls.connection_string, script, *parameters), cached_timeout)

	@classmethod
	def change_parameter(cls, script, update_list):
		for item in update_list:
			opening_tag = f'/*<{item[0]}>*/'
			closing_tag = f'/*</{item[0]}>*/'

			start = script.index(opening_tag) + len(opening_tag)
			end = script.index(closing_tag, start)

			old_value = f'{opening_tag}{script[start:end]}{closing_tag}'
			new_value = f'{opening_tag}{item[1]}{closing_tag}'

			script = script.replace(old_value, new_value)

		return script
