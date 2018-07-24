from flask import Blueprint, current_app
import os

# Read package.json
base_dir = current_app.root_path.rsplit(os.sep, 1)[0]
package_json_path = os.path.join(base_dir, 'package.json')


def get_version_package_json(version_str):
	version = ''
	for char in version_str:
		if char.isdigit() or char == '.':
			version += char
	return version


def create_framework_blueprint(framework_name, app, jslibs=None) -> Blueprint:
	blueprint = Blueprint(framework_name, __name__, template_folder='templates', static_folder='static', url_prefix='')

	app.jinja_env.globals['framework_folder'] = blueprint.name
	app.jinja_env.globals['framework_template'] = '/'.join((blueprint.name, 'base.html'))

	if jslibs:
		app.jinja_env.globals['framework_js'] = jslibs

	return blueprint
