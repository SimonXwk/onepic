import pymongo
from flask import current_app


class Client(object):
	def __init__(self, is_developer=False):
		self._connection_string = current_app.config.get('MONGO_TLMA_DB_DEVELOP_URI') if is_developer else current_app.config.get('MONGO_TLMA_DB_ANALYST_URI')

	def __enter__(self):
		self.client = pymongo.MongoClient(self._connection_string)
		self.tlma = self.client['tlma']
		return self

	def __exit__(self, exc_type, exc_val, exc_tb):
		self.client.close()

	def get_db(self, db_name):
		return self.client[db_name]

	@classmethod
	def to_array(cls, cursor):
		return [row for row in cursor]
