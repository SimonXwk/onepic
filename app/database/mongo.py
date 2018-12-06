from pymongo import MongoClient


class Client(object):
	def __init__(self, connection_string):
		self._connection_string = connection_string

	def __enter__(self):
		self.client = MongoClient(self._connection_string)
		return self

	def __exit__(self, exc_type, exc_val, exc_tb):
		self.client.close()

	def get_db(self, db_name):
		return self.client[db_name]
