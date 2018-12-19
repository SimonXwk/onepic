from werkzeug.utils import find_modules, import_string
from flask.blueprints import Blueprint
from app.helper import LazyView


class MyBlueprint(Blueprint):
	def __init__(self, import_name, has_url_prefix=True, **options):
		# Blueprint's name & url_prefix(if has_url_prefix=true) will be using it's folder's name(derived from import_name, which is '__name__' passed in)
		__blueprint_name = import_name.rsplit('.', 1)[-1]
		super(MyBlueprint, self).__init__(__blueprint_name, import_name, static_folder='static', template_folder='templates', url_prefix='/' + __blueprint_name if has_url_prefix else '', **options)
		print(f' $ Blueprint [{__blueprint_name}] Created')

	def lazy_load_view_func(self, import_name):
		# Prefix with the blueprint's import name
		string_to_import = '.'.join((self.import_name, import_name))
		return LazyView(string_to_import)

	def add_lazy_url(self, import_name, url_rules=None, **options):
		url_rules = [] if url_rules is None else url_rules
		lazy_loader = self.lazy_load_view_func(import_name)
		for url_rule in url_rules:
			self.add_url_rule(url_rule, view_func=lazy_loader, **options)

	def add_lazy_filter(self, import_name, **options):
		lazy_loader = self.lazy_load_view_func(import_name)
		self.add_app_template_filter(lazy_loader, **options)

	def add_lazy_test(self, import_name, **options):
		lazy_loader = self.lazy_load_view_func(import_name)
		self.add_app_template_test(lazy_loader, **options)

	def add_app_context_processor(self, import_name):
		lazy_loader = self.lazy_load_view_func(import_name)
		self.record_once(lambda s: s.app.template_context_processors.setdefault(None, []).append(lazy_loader))

	def register_lazy_urls(self, view_func_dics):
		for view_func_dic in view_func_dics:
			self.add_lazy_url(**view_func_dic)

	def register_lazy_filters(self, items):
		for item in items:
			self.add_lazy_filter(**item)

	def register_lazy_tests(self, items):
		for item in items:
			self.add_lazy_test(**item)

	def register_lazy_app_context_processors(self, import_names):
		for import_name in import_names:
			self.add_app_context_processor(import_name)


# Circular import in Blueprint is not allowed for this method
def get_blueprint_objects(blueprint_obj_name='bp', **kwargs):
	blueprint_package_path_string = __name__
	print(f' * Searching in package "{blueprint_package_path_string}"')
	for dotted_module_name in find_modules(blueprint_package_path_string, **kwargs):
		print(f'\n   Provoking Script in /{dotted_module_name}/ to Run')
		module = import_string(dotted_module_name, silent=False)
		print(f'   Looking for attribute "{blueprint_obj_name}" in module /{dotted_module_name}/')
		if hasattr(module, blueprint_obj_name):
			# Fetch this Object, to be used for registering later to Flask App
			bp = import_string(':'.join((dotted_module_name, blueprint_obj_name)))
			if isinstance(bp, Blueprint):
				print(f'   Found Blueprint {bp} - [name: {bp.name}]')
				yield bp
			else:
				print(f' - ["{blueprint_obj_name}"] is not a Blueprint Object !')
		else:
			print(f' - ["{blueprint_obj_name}"] can not be found !')


def register_blueprints(app, blueprint_obj_name='bp', **kwargs):
	print('-' * 100)
	print(f' * Registering Blueprints to {app}')
	for blueprint in get_blueprint_objects(blueprint_obj_name=blueprint_obj_name, **kwargs):
		# This Action will actually import the Blueprint object (because we use lazy generator here),
		# hence the script in the module/package__init__ will run after app.register_blueprint(blueprint)
		app.register_blueprint(blueprint)
		print(f' + <{blueprint.name}>')
		# Script in Blueprint .py file will run at the end for this iteration of for loop
	print('-' * 100)

