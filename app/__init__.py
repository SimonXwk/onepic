from flask import send_from_directory, current_app, render_template
import os
from configuration import app_config_dict as cfg
from .blueprints import register_blueprints
from .helper import LazyLoader
from .api import ApiFlask
from werkzeug.contrib.fixers import ProxyFix


def create_app(test_config=None):
	print("{}".format('-' * 60))
	import_name = __name__.split('.')[0]
	# step 1: Create Flask application object
	app = ApiFlask(import_name, instance_relative_config=True)
	# Stop Jinja2 from keeping white spaces
	app.jinja_env.trim_blocks = True
	app.jinja_env.lstrip_blocks = True
	# app.register_api_error_handler()
	app.wsgi_app = ProxyFix(app.wsgi_app)
	print(">> Import name [{}] applied".format(import_name))
	# step 2: Builtin/Extensions/MyOwn Flask Configuration
	app.config.from_object(cfg.get('base'))

	# step 3: Overwrite Flask Configuration with cfg file in instance folder when not testing
	if test_config is None:
		print('>> No testing configuration found')
		app.config.from_pyfile('config.cfg', silent=True)
	else:
		# load the test config if passed in
		print('>> Applying testing configuration')
		app.config.from_mapping(test_config)

	# Ensure the instance folder exists
	try:
		os.makedirs(app.instance_path)
	except OSError:
		print('>> Instance folder found')
		pass

	"""Binds the application only.
	> For as long as the application is bound to the current context the :data:`flask.current_app` points to that application.
	> An application context is automatically created when a request context is pushed if necessary
	"""
	with app.app_context():
		# step 4:
		# Initialize extensions to current app object, this should be done after the flask object configuration
		from .extension import init_app_extensions
		init_app_extensions(app)
		# step 5: Register Blueprints
		register_blueprints(app, 'bp', include_packages=True, recursive=False)

		# step 6:
		# Init the DataBase
		from app.database.sqlalchemy_database import db_session

	# LazyLoad URL rules
	loader = LazyLoader(app)
	loader.url('favicon', ['/favicon.ico'], endpoint='favicon')
	loader.url('find_vendor_folder', ['/static/vendor/<path:filename>'], endpoint='vendor')
	loader.url('hidden_portal', ['/tt'])

	# LazyLoad Jinja filter functions
	loader.filter('filters.format_currency', name='currency')
	loader.filter('filters.format_number', name='number')
	loader.filter('filters.division', name='div')
	loader.filter('filters.percentage', name='pct')
	loader.filter('filters.format_datetime_au', name='dtAU')
	loader.filter('filters.format_date_au', name='dAU')
	loader.filter('filters.format_date_sort', name='dSort')
	loader.filter('filters.format_datetime_sort', name='dtSort')
	loader.filter('filters.filter_month_name', name='mthname')
	loader.filter('filters.filter_add_working_days', name='addworkingdays')
	loader.filter('filters.filter_to_date', name='strpdt')
	loader.filter('filters.filter_financial_year', name='FY')
	loader.filter('filters.financial_year_month', name='fymth')

	loader.filter('filters.filter_datetime_offset', name='dtOffset')

	loader.filter('filters.filter_filename', name='fname')
	loader.filter('filters.filter_mail_excel_month', name='mailmonth')

	# Close the session after each request or application context shutdown
	@app.teardown_appcontext
	def shutdown_session(exception=None):
		db_session.remove()

	print("{}".format('-' * 60))
	return app  # Return application object/instance


# URL Rule: Handle old favicon standard (The old standard is to serve this file, with this name, at the website root.)
def favicon():
	return send_from_directory(os.path.join(current_app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')


def find_vendor_folder(filename=None):
	return send_from_directory(os.path.join(current_app.root_path, 'static/vendor'), filename)


def hidden_portal():
	return render_template('test.html')
