from werkzeug.utils import import_string, cached_property
from flask import Blueprint, request, render_template
from functools import wraps, singledispatch
from flask_login import login_required
from decimal import Decimal
import datetime
import time
import json


class LazyView(object):
	def __init__(self, import_name):
		self.__module__, self.__name__ = import_name.rsplit('.', 1)
		self.import_name = import_name

	@cached_property
	def view(self):
		print('--> {{Lazy Loading Function}} - <{}>'.format(self.import_name))
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
		url_rules = [] if url_rules is None else url_rules
		view = LazyView(self.full_import_name(import_name))
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

	def test(self, import_name, name=None):
		view = LazyView(self.full_import_name(import_name))
		if isinstance(self.flask_proxy, Blueprint):
			# Register Filter Function on Blueprint instance
			self.flask_proxy.add_app_template_test(view, name=name)
		else:
			# Register Filter Function on Flask instance
			self.flask_proxy.add_template_test(view, name=name)


def create_blueprint(blueprint_name, import_name, prefixed=True, **options) -> Blueprint:
	bp = Blueprint(blueprint_name, import_name, static_folder='static', template_folder='templates', url_prefix='/' + blueprint_name if prefixed else '', **options)
	# if not prefixed:
	# 	def find_static_folder(filename=None):
	# 		bp.send_static_file()
	# 		return send_from_directory(os.path.join(bp.root_path, 'static'), filename)
	# 	bp.add_url_rule(blueprint_name + '/static/<path:filename>', endpoint='static', view_func=find_static_folder)

	return bp


def templatified(template=None, title=None, absolute=False, extension='html', require_login=False):
	""" Function that accepts arguments passed to decorator and creates the Actual Decorator
	:param template: The Name of the template that will be used in flask.render_template(template)
	:param title: The Name of page title, passed to flask.render_template() as a parameter
	:param absolute: set to True when the template provided in its full path, no further process needed in this function
	:param extension: default to .html if not provided, the template string will be checked if ends with extension string
	:param require_login: whether login is required to have access to this view
	:return: Decorator function
	"""
	""" When using 'a decorator with arguments @something(your own args)', the process is as follows:
	1. 'templatified(your arguments)' is called (only once when using @... to create a decorator) and is expected to return the actual decorator function 'decorator'
	2. 'decorator(f)' is called and expected to return 'decorated_function(*args, **kwargs)' as the decorated function'myCallingFunc'
	3. 'decorated_function(*args, **kwargs)' is assign to the calling function 'myCallingFunc = decorated_function(myCallingFunc) '
	4. When calling 'myCallingFunc', 'decorated_function' will be executed
	step 1 is what defers the Decorator with argument from Decorator without argument
	this is equivalent to 
	"""

	def decorator(f):
		"""
		Actual Decorator that will decorate the decorated function
		:param f: function to be decorated
		:return: new decorated function
		"""

		@wraps(f)
		def decorated_function(*args, **kwargs):
			""" Process the template variable and construct the template_name for flask.render_template(template_name)
			Replace '.' in request.endpoint with '/'
			Case 1: No template provided, use the /endpoint.html
			Case 2: template provided as absolute path to root, template.html instead
			Case 3: template provided as a name only, use the /endpoint(take out last part) + template.html 
			"""
			template_name, page_title = template, title

			# If template was not provided, use the endpoint path instead
			if template_name is None or str(template_name).strip() == '':
				template_name = request.endpoint.replace('.', '/')
			# If template was not given by its full path, then append the sub-folder name in front of it (which should be created using its blueprint's name)
			elif not absolute:
				template_name = '/'.join((request.blueprint, template_name)) if request.blueprint else template_name
			# If template does not end with the extension provided, append it
			if template_name[-len(extension):] != extension:
				template_name = '.'.join((template_name, extension))

			# By default add a title parameter to flask.render_template() function using dictionary unpacking
			if page_title is None:
				page_title = request.endpoint.replace('_', ' ').title()
				if not (request.blueprint is None):
					page_title = page_title.rsplit('.', 1)[1]
			default_dic = {'title': page_title}  # Page title block in global jinja template block

			# Run the wrapped function, which should return a dictionary of Parameters
			dic = f(*args, **kwargs)

			if not isinstance(dic, dict):
				try:
					dic = dict(dic)
				except TypeError:
					# todo : Find a better way to deal with this scenario
					print(f'!!! Failed Conversion: Object type [ {dic.__class__.__name__} ] returned by view function [ {f.__name__} ] needs to be a dictionary ! The whole result will be set to dict()')
					dic = {}

			# Merge two dic, default dic will be overwritten if same key appears in the dictionary returned by the function
			dic = {**default_dic, **dic}

			# Render the template
			return render_template(template_name, **dic)

		if require_login:
			decorated_function = login_required(decorated_function)

		return decorated_function

	return decorator


@singledispatch
def convert_extend_types(obj):
	raise TypeError(f'can not convert {type(obj)}')


@convert_extend_types.register(datetime.datetime)
def _(obj):
	return obj.strftime('%Y-%m-%dT%H:%M:%SZ')


@convert_extend_types.register(datetime.date)
def _(obj):
	return obj.strftime('%Y-%m-%dT%H:%M:%SZ')


@convert_extend_types.register(Decimal)
def _(obj):
	return float(obj)


@convert_extend_types.register(set)
def _(obj):
	return tuple(obj)


class ExtendJSONEncoder(json.JSONEncoder):
	def default(self, obj):
		try:
			return convert_extend_types(obj)
		except TypeError:
			return super(ExtendJSONEncoder, self).default(obj)


def jsonified(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		res = f(*args, **kwargs)
		if res is None:
			res = {}
		return json.dumps(res, cls=ExtendJSONEncoder)
	return decorated_function


def timeit(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		ts = time.time()
		res = f(*args, **kwargs)
		te = time.time()
		print(f'::: execution time of [{f.__name__}] : {((te - ts) * 1000):,.2f} ms')
		return res

	return decorated_function


def request_arg(arg_name, default, check_func, strip=True):
	arg = request.args.get(arg_name)
	if not (arg is None) and check_func(arg):
		return arg.strip() if strip else arg
	return default


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
