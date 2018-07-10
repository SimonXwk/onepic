import json
from .helper import get_version_package_json, create_framework_blueprint, package_json_path


class Bootstrap(object):
	# Read NPM's package.json to get version information
	with open(package_json_path) as f:
		package_json = json.load(f)
		bootstrap_package_version = get_version_package_json(package_json['dependencies']['bootstrap'])
		bootstrap_jquery_package_version = get_version_package_json(package_json['dependencies']['jquery'])
		bootstrap_popper_package_version = get_version_package_json(package_json['dependencies']['popper.js'])

	def __init__(self, app):
		# Bound to Flask object
		self.app = app
		# Set Default
		self.app.config.setdefault('BOOTSTRAP_SERVE_LOCAL', False)
		self.app.config.setdefault('BOOTSTRAP_USE_PACKAGE_JSON_VERSION', True)
		self.app.config.setdefault('BOOTSTRAP_VERSION', self.bootstrap_package_version)
		self.app.config.setdefault('BOOTSTRAP_JQUERY_VERSION', self.bootstrap_jquery_package_version)
		self.app.config.setdefault('BOOTSTRAP_POPPER_VERSION', self.bootstrap_popper_package_version)
		# Define all javascript libraries
		self.jslibs = self.javascript_libs()

	def javascript_libs(self):
		# Build Frame work url
		use_package_json = self.app.config.get('BOOTSTRAP_USE_PACKAGE_JSON_VERSION')
		serve_local = self.app.config.get('BOOTSTRAP_SERVE_LOCAL')

		# Find each javascript library for the current framework
		bootstrap_js = '/'.join(('', 'static', 'vendor', 'bootstrap.min.js')) if serve_local else \
			self.app.config.get('BOOTSTRAP_JS_CDN').format(self.bootstrap_package_version if use_package_json else self.app.config.get('BOOTSTRAP_VERSION'))
		bootstrap_jquery = '/'.join(('', 'static', 'vendor', 'jquery.min.js')) if serve_local else \
			self.app.config.get('BOOTSTRAP_JQUERY_CDN').format(self.bootstrap_jquery_package_version if use_package_json else self.app.config.get('BOOTSTRAP_JQUERY_VERSION'))
		bootstrap_popper = '/'.join(('', 'static', 'vendor', 'popper.min.js')) if serve_local else \
			self.app.config.get('BOOTSTRAP_POPPER_CDN').format(self.bootstrap_popper_package_version if use_package_json else self.app.config.get('BOOTSTRAP_POPPER_VERSION'))
		return [bootstrap_jquery, bootstrap_popper, bootstrap_js]

	def to_blueprint(self):
		# print(__name__.split('.')[-1])
		return create_framework_blueprint(__name__.split('.')[-1], self.app, self.jslibs)
