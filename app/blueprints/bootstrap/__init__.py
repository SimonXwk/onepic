from flask import Blueprint, current_app
import os
import json


def get_version_package_json(version_str):
	version = ''
	for char in version_str:
		if char.isdigit() or char == '.':
			version += char
	return version


# Read package.json
base_dir = current_app.root_path.rsplit(os.sep, 1)[0]
package_json = os.path.join(base_dir, 'package.json')
with open(package_json) as f:
	data = json.load(f)
	bootstrap_package_version = get_version_package_json(data['dependencies']['bootstrap'])
	bootstrap_jquery_package_version = get_version_package_json(data['dependencies']['jquery'])
	bootstrap_popper_package_version = get_version_package_json(data['dependencies']['popper.js'])

# Set Default
current_app.config.setdefault('BOOTSTRAP_SERVE_LOCAL', False)
current_app.config.setdefault('BOOTSTRAP_USE_PACKAGE_JSON_VERSION', True)
current_app.config.setdefault('BOOTSTRAP_VERSION', bootstrap_package_version)
current_app.config.setdefault('BOOTSTRAP_JQUERY_VERSION', bootstrap_jquery_package_version)
current_app.config.setdefault('BOOTSTRAP_POPPER_VERSION', bootstrap_popper_package_version)

# Build Frame work url
use_package_json = current_app.config.get('BOOTSTRAP_USE_PACKAGE_JSON_VERSION')
serve_local = current_app.config.get('BOOTSTRAP_SERVE_LOCAL')

bootstrap_js = '/'.join(('', 'static', 'vendor', 'bootstrap.min.js')) if serve_local else \
	current_app.config.get('BOOTSTRAP_JS_CDN').format(bootstrap_package_version if use_package_json else current_app.config.get('BOOTSTRAP_VERSION'))
bootstrap_jquery = '/'.join(('', 'static', 'vendor', 'jquery.min.js')) if serve_local else \
	current_app.config.get('BOOTSTRAP_JQUERY_CDN').format(bootstrap_jquery_package_version if use_package_json else current_app.config.get('BOOTSTRAP_JQUERY_VERSION'))
bootstrap_popper = '/'.join(('', 'static', 'vendor', 'popper.min.js')) if serve_local else \
	current_app.config.get('BOOTSTRAP_POPPER_CDN').format(bootstrap_popper_package_version if use_package_json else current_app.config.get('BOOTSTRAP_POPPER_VERSION'))

bp = Blueprint('bootstrap', __name__, template_folder='templates', static_folder='static', url_prefix='')

current_app.jinja_env.globals['framework_folder'] = bp.name + '/'
current_app.jinja_env.globals['framework_template'] = '/'.join((bp.name, 'base.html'))
current_app.jinja_env.globals['framework_js'] = (bootstrap_jquery, bootstrap_popper, bootstrap_js)

