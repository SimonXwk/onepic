from flask import Flask, send_from_directory, current_app, url_for
import os
from configuration import app_config_dict as cfg


# URL Rule: Handle old favicon standard (The old standard is to serve this file, with this name, at the website root.)
def favicon():
	return send_from_directory(os.path.join(current_app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')


def find_vendor_folder(filename=None):
	return send_from_directory(os.path.join(current_app.root_path, 'static/vendor'), filename)


def find_highchart_folder(filename=None):
	return send_from_directory(os.path.join(current_app.root_path, 'static/vendor/hc'), filename)


def create_app(config_name):
	# Create application object
	app = Flask(__name__.split('.')[0], instance_relative_config=True)

	# step 1:
	# Standard Flask and Flask_extension Configuration
	app.config.from_object(cfg[config_name])  # Stand Flask and Flask_extension Configuration
	# step 2:
	# Overwrite Configuration with cfg file in instance folder
	app.config.from_pyfile('config.cfg')

	"""Binds the application only.
	> For as long as the application is bound
	to the current context the :data:`flask.current_app` points to that
	application.
	> An application context is automatically created when a
	request context is pushed if necessary
	"""
	with app.app_context():
		# step 3:
		# Initialize extensions to current app object, this should be done after the flask object configuration
		from .extensions import init_app_extensions
		init_app_extensions(app)
		# step 4:
		# Register Blueprints
		from .blueprints import Blueprints as Blps
		Blps.register_blueprints(app)
		# step 5:
		# Init the DataBase
		from app.database.sqlalchemy_database import db_session

		# Handle old favicon standard (The old standard is to serve this file, with this name, at the website root.)
		app.add_url_rule('/favicon.ico', endpoint='favicon', view_func=favicon)
		# Customized endpoint rule
		app.add_url_rule('/static/vendor/<path:filename>', endpoint='vendor', view_func=find_vendor_folder)
		app.add_url_rule('/static/vendor/hc/<path:filename>', endpoint='hc', view_func=find_highchart_folder)

	# Close the session after each request or application context shutdown
	@app.teardown_appcontext
	def shutdown_session(exception=None):
		db_session.remove()

	return app  # Return application object/instance
