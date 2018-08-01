from flask import current_app
from app.api import ApiResult, ApiException
from app.cache import cached
import json
import urllib.request, urllib.parse, urllib.error
import http.client
import requests
from functools import wraps


class StarShipItAPI(object):
	# Configurations
	star_ship_it_api_host = 'api.starshipit.com'
	star_ship_it_api_url = 'https://api.starshipit.com'
	api_key = current_app.config['STARSHIPIT_API_KEY']
	subscription_key_primary = current_app.config['STARSHIPIT_OCP_APIM_SUBSCRIPTION_PRIMARY_KEY']
	subscription_key_secondary = current_app.config['STARSHIPIT_OCP_APIM_SUBSCRIPTION_SECONDARY_KEY']

	# Request Headers
	headers = {
		'StarShipIT-Api-Key': api_key,
		'Ocp-Apim-Subscription-Key': subscription_key_primary,
	}

	# Function that returns the API result
	@classmethod
	def call_api(cls, method, endpoint, params, decode='utf-8'):
		# try:
		result = cls.use_request(method, endpoint, params, decode)
		json_loaded_data = json.loads(result)
		return ApiResult(json_loaded_data)
		# except Exception as e:
		# 	raise ApiException("Err".format(e))

	# Using Requests Library
	@classmethod
	@cached(3600)
	def use_request(cls, method, endpoint, params, decode):
		if cls.star_ship_it_api_url[-1] != '/' and endpoint[0] != '/':
			url = '/'.join((cls.star_ship_it_api_url, endpoint))
		elif cls.star_ship_it_api_url[-1] == '/' and endpoint[0] == '/':
			url = cls.star_ship_it_api_url + endpoint[1:]
		else:
			url = cls.star_ship_it_api_url + endpoint

		if method.upper() == 'GET':
			r = requests.get(url,  params=params, headers=cls.headers)
			print(r.url, r.status_code, '-> result \n')
			# r.encoding = 'utf-8'
			data = r.text
			return data

	# Using Standard Libraries
	@classmethod
	@cached(3600)
	def use_urllib(cls, method, endpoint, params, decode):
		if params:
			endpoint = endpoint + '?' + urllib.parse.urlencode(params)

		conn = http.client.HTTPConnection(cls.star_ship_it_api_host)
		conn.request(method, endpoint, "{body}", cls.headers)
		response = conn.getresponse()
		data = response.read()  # Read data as bytes
		print(f'StarShip API Result:\n{data}')
		data = data.decode(decode)
		conn.close()
		return data

	# Decorator for individual API functions
	def __call__(self, f):
		@wraps(f)
		def decorated_function(*args, **kwargs):
			dic = f(*args, **kwargs)
			if dic is None:
				raise ApiException('No argument dictionary passed from API function ')
			elif not isinstance(dic, dict):
				raise ApiException('Arguments passed from API functions must be dictionary')
			return self.call_api(**dic)
		return decorated_function


@StarShipItAPI()
def search_orders(phrase=None, limit=50, page=1):
	api_call = {
		'method': 'GET',
		'endpoint': '/api/orders/search',
		'params': {}
	}
	# Request parameters
	if phrase:
		api_call['params']['phrase'] = str(phrase)
		api_call['params']['limit'] = limit
		api_call['params']['page'] = page
	return api_call


@StarShipItAPI()
def get_order(order_id):
	api_call = {
		'method': 'GET',
		'endpoint': '/api/orders',
		'params': {'order_id': order_id}
	}
	return api_call


@StarShipItAPI()
def track_details(tracking_number=None):
	api_call = {
		'method': 'GET',
		'endpoint': '/api/track',
		'params': {}
	}
	if tracking_number:
		api_call['params']['tracking_number'] = str(tracking_number)
	return api_call


@StarShipItAPI()
def get_unshipped_orders(since_order_date=None, limit=50, page=1):
	api_call = {
		'method': 'GET',
		'endpoint': '/api/orders/unshipped',
		'params': {}
	}
	if since_order_date:
		api_call['params']['since_order_date'] = str(since_order_date)   # date-time in RFC3339
		api_call['params']['limit'] = limit
		api_call['params']['page'] = page
	return api_call


@StarShipItAPI()
def get_users_address_book():
	api_call = {
		'method': 'GET',
		'endpoint': '/api/addressbook',
		'params': {}
	}
	return api_call

