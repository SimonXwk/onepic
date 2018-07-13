from flask import current_app
import pyodbc
import os
import datetime
from app.cache import cache


class ODBCResult:
	def __init__(self, data, cached_timeout):
		self.rows = data
		self.timestamp = datetime.datetime.now()
		self.cached_timeout = cached_timeout

	def __repr__(self):
		return 'data retrieved at {} :\n{}'.format(self.timestamp, self.rows)


class ThankqODBC:
	connection_string_reporter1 = current_app.config.get('TQ_PRT1_CONNECTION_STRING')
	connection_string_reporter2 = current_app.config.get('TQ_PRT2_CONNECTION_STRING')
	connection_string = connection_string_reporter1
	script_folder = os.path.join(current_app.root_path, 'database\scripts')
	cached_timeout_seconds = 2 * 60  # Set Cache timeout in seconds

	@classmethod
	def format_date(cls, value, fmt='%Y/%m/%d'):
		return value.strftime(fmt)

	@classmethod
	def query(cls, file_name, *parameters, cached_timeout=2*60):
		cache_item = '.'.join((__name__, file_name))
		result = cache.get(cache_item)
		if result is None:
			print('> Fetching data via ODBC for result [{}]'.format(cache_item))
			sql_file = os.path.join(cls.script_folder, file_name if file_name[-4:] == '.sql' else file_name + '.sql')
			# flask.open_resource use open(os.path.join(self.root_path, resource), mode) as return value
			#  therefore strip leading/tailing slashes for the sake of os.path.join(..., ...)
			with current_app.open_resource(sql_file, 'r') as f:
				script = " ".join(f.readlines())
				with pyodbc.connect(cls.connection_string) as conn:
					cursor = conn.cursor()  # Create a cursor from the connection
					# If there are no rows: fetchall() and fetchmany() will both return empty list of row objects.
					# Row objects are similar to tuples, but they also allow access to columns by name: row[1]/row.colname
					rows = cursor.execute(script, *parameters).fetchall()  # A List
					# stamp = cursor.execute('SELECT CURRENT_TIMESTAMP').fetchone()[0]  # A Tuple
					result = ODBCResult(rows, cached_timeout)
					cache.set(cache_item, result, timeout=cached_timeout)  # Set Cache for 5 minutes
		else:
			print('> Cached ODBC result used for [{}] (cached for {} minutes {} seconds) '.format(cache_item, int(cached_timeout/60), int(cached_timeout % 60)))
		return result
