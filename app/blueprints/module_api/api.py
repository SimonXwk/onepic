from flask import json, Response
from functools import wraps


class ApiResult(object):
	def __init__(self, value, status=200):
		self.value = value
		self.status = status

	def to_response(self):
		return Response(json.dumps(self.value), status=self.status, mimetype='application/json')


class ApiException(object):
	def __init__(self, message, status=400):
		self.message = message
		self.status = status

	def to_result(self):
		return ApiResult(dict(message=self.message), status=self.status)


def register_error_handlers(mod):
	mod.register_error_handler(ApiException, lambda err: err.to_result)


def responsed(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		res = f(*args, **kwargs)
		if isinstance(res, ApiResult):
			return res.to_response()
		elif isinstance(res, ApiException):
			return res.to_result().to_response()
	return decorated_function

