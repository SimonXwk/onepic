from werkzeug.utils import find_modules, import_string
from flask.blueprints import Blueprint


# Circular import in Blueprint is not allowed for this method
def get_blueprint_objects(blueprint_obj_name='bp', **kwargs):
	blueprint_package_path_string = __name__
	print(f' * Searching in package "{blueprint_package_path_string}"')
	for dotted_module_name in find_modules(blueprint_package_path_string, **kwargs):
		module = import_string(dotted_module_name, silent=False)
		print(f'   Looking for attribute "{blueprint_obj_name}" in module /{dotted_module_name}/')
		if hasattr(module, blueprint_obj_name):
			bp = import_string(':'.join((dotted_module_name, blueprint_obj_name)))
			if isinstance(bp, Blueprint):
				print(f'   Found Blueprint {bp} - [name: {bp.name}]')
				yield bp
		else:
			print(f' - ["{blueprint_obj_name}" ???] can not be found !')


def register_blueprints(app, blueprint_obj_name='bp', **kwargs):
	print('-' * 100)
	print(f' * Registering Blueprint Instances to {app}')
	for blueprint in get_blueprint_objects(blueprint_obj_name=blueprint_obj_name, **kwargs):
		app.register_blueprint(blueprint)
		print(f' + <{blueprint.name}>')
	print('-' * 100)
