from werkzeug.utils import import_string, cached_property
from flask import Blueprint, request, render_template, jsonify
from functools import wraps
from app.cache import cache

class LazyView(object):
	def __init__(self, import_name):
		self.__module__, self.__name__ = import_name.rsplit('.', 1)
		self.import_name = import_name

	@cached_property
	def view(self):
		print('--> Lazy Loading Function : [{}]'.format(self.import_name))
		return import_string(self.import_name)

	def __call__(self, *args, **kwargs):
		return self.view(*args, **kwargs)


class LazyLoader(object):
	def __init__(self, flask_proxy):
		self.flask_proxy = flask_proxy

	def full_import_name(self, import_name):
		# Prefix the import name by the app name or blueprint name and '.'
		return '.'.join((self.flask_proxy.import_name, import_name))

	def url(self, import_name, url_rules=None, **options):
		view = LazyView(self.full_import_name(import_name))
		url_rules = [] if url_rules is None else url_rules
		# Flask object and Blueprint object share the same function add_url_rule(rule, endpoint=None, view_func=None, **options)
		for url_rule in url_rules:
			# If multiple URL map to single view function, put all URLs to a list and call this function only once
			# Otherwise get AssertionError: View function mapping is overwriting an existing endpoint
			self.flask_proxy.add_url_rule(url_rule, view_func=view, **options)

	def filter(self, import_name, name=None):
		view = LazyView(self.full_import_name(import_name))
		if isinstance(self.flask_proxy, Blueprint):
			# Register Filter Function on Blueprint instance
			self.flask_proxy.add_app_template_filter(view, name=name)
		else:
			# Register Filter Function on Flask instance
			self.flask_proxy.add_template_filter(view, name=name)


def create_blueprint(blueprint_name, import_name, prefixed=True, **options) -> Blueprint:
	bp = Blueprint(blueprint_name, import_name, static_folder='static', template_folder='templates', url_prefix='/' + blueprint_name if prefixed else '', **options)
	# if not prefixed:
	# 	def find_static_folder(filename=None):
	# 		bp.send_static_file()
	# 		return send_from_directory(os.path.join(bp.root_path, 'static'), filename)
	# 	bp.add_url_rule(blueprint_name + '/static/<path:filename>', endpoint='static', view_func=find_static_folder)

	return bp


def templatified(template=None, absolute=False, extension='.html'):
	def decorator(f):
		@wraps(f)
		def decorated_function(*args, **kwargs):
			template_name = template
			""" Process the template variable and construct the template_name for flask.render_template(template_name)
			Replace '.' in request.endpoint with '/'
			Case 1: No template provided, use the /endpoint.html
			Case 2: template provided as absolute path to root, template.html instead
			Case 3: template provided as a name only, use the /endpoint(take out last part) + template.html 
			"""
			if template_name is None:
				template_name = request.endpoint.replace('.', '/') + extension
			else:
				if template_name[-len(extension):] != extension:
					template_name = template_name + extension
				if not absolute:
					template_name = '/'.join((request.endpoint.rsplit('.', 1)[0].replace('.', '/'), template_name))
			# Run the wrapped function, which should return a dictionary of Parameters
			dic = f(*args, **kwargs)
			if dic is None:
				dic = {}
			elif not isinstance(dic, dict):
				return dic
			# Render the template
			return render_template(template_name, **dic)
		return decorated_function
	return decorator


def cached(func_params='no_parameters', cached_timeout=2*60):
	def decorator(f):
		@wraps(f)
		def decorated_function(*args, **kwargs):
			cache_item = '.'.join((f.__module__, f.__name__, func_params))
			result = cache.get(cache_item)
			if result is not None:
				print('>> using cached result for [{}] (cached for {} seconds) '.format(cache_item, cached_timeout))
				return result
			result = f(*args, **kwargs)
			cache.set(cache_item, result, timeout=cached_timeout)
			print('>> recalculated result for [{}] is cached for {} seconds from now'.format(cache_item, cached_timeout))
			return result
		return decorated_function
	return decorator


def jsonified(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		res = f(*args, **kwargs)
		if res is None:
			res = {}
		return jsonify(res)
	return decorated_function


def to_data_frame(header=None):
	def decorator(f):
		@wraps(f)
		def decorated_function(*args, **kwargs):
			# Run the wrapped function, which should return (())/[[]]/generator
			data = f(*args, **kwargs)
			from pandas import DataFrame
			df = DataFrame(data)
			if header:
				df.columns = header
			return df
		return decorated_function
	return decorator
