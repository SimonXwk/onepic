from werkzeug.utils import find_modules, import_string
from flask.blueprints import Blueprint


# Circular import in Blueprint is not allowed for this method
def register_blueprints(app, blueprint_folder='blueprints', blueprint_obj_name='bp', **kwargs):
	blueprint_package = '.'.join((app.name, blueprint_folder))
	for dotted_module_name in find_modules(blueprint_package, **kwargs):
		module = import_string(dotted_module_name, silent=False)
		print('- Searching for Blueprint object named \'{}\' in {}'.format(blueprint_obj_name, dotted_module_name))
		if hasattr(module, blueprint_obj_name):
			blueprint = import_string(':'.join((dotted_module_name, blueprint_obj_name)))
			if isinstance(blueprint, Blueprint):
				print('- Found [{}]-({}:{}), registering to [{}]'.format(blueprint, blueprint_obj_name, blueprint.name, app))
				app.register_blueprint(blueprint)
				print('V [{}] Registered !'.format(blueprint.name))
		else:
			print('X Can not found object named [{}]'.format(blueprint_obj_name))
