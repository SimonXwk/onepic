from werkzeug.utils import find_modules, import_string
from flask.blueprints import Blueprint


# Circular import in Blueprint is not allowed for this method
def register_blueprints(app, blueprint_package='blueprints', blueprint_obj_name='bp', **kwargs):
	blueprint_package = '.'.join((app.name, blueprint_package))
	print(f'===> Attempting to register Blueprint objects named "{blueprint_obj_name}" in package {blueprint_package} to Flask object {app}')
	for dotted_module_name in find_modules(blueprint_package, **kwargs):
		module = import_string(dotted_module_name, silent=False)
		print(f'? Searching {dotted_module_name}: ', end='\t')
		if hasattr(module, blueprint_obj_name):
			blueprint = import_string(':'.join((dotted_module_name, blueprint_obj_name)))
			if isinstance(blueprint, Blueprint):
				print(f'-> [{blueprint_obj_name}:{blueprint.name}]-{blueprint} was found')
				app.register_blueprint(blueprint)
				print(f'V Registered !')
		else:
			print(f'\nX Can not found object named [{blueprint_obj_name}]')
