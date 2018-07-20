from flask import Response, json, Flask
from werkzeug.exceptions import HTTPException


# API Result Wrapper
class ApiResult(object):
	def __init__(self, value, status=200):
		self.value = value
		self.status = status

	def to_response(self):
		return Response(json.dumps(self.value), status=self.status, mimetype='application/json')


# API Errors
class ApiException(Exception):
	def __init__(self, message, status=400):
		self.message = message
		self.status = status

	def to_result(self):
		return ApiResult({'message': self.message}, status=self.status)

	def __call__(self, *args, **kwargs):
		return self.to_result()


class ApiFlask(Flask):
	""" This is an API Response Converter by subclassing Flask class """
	def make_response(self, rv):
		if isinstance(rv, ApiResult):
			return rv.to_response()
		return Flask.make_response(self, rv)

	def register_api_error_handler(self):
		self.register_error_handler(ApiException, lambda err: err.to_result)
