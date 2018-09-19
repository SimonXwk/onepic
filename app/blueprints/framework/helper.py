from flask import Blueprint


def create_framework_blueprint(framework_name, app, jslibs=None) -> Blueprint:
	blueprint = Blueprint(framework_name, __name__, template_folder='templates', static_folder='static', url_prefix='')

	app.jinja_env.globals['framework_folder'] = blueprint.name
	app.jinja_env.globals['framework_template'] = '/'.join((blueprint.name, 'base.html'))

	if jslibs:
		app.jinja_env.globals['framework_js'] = jslibs

	return blueprint
