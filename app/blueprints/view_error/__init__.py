from app.blueprints.helpers import create_blueprint
from flask import render_template, abort

mod = create_blueprint('error', __name__)


@mod.app_context_processor
def inject_error_blueprint_name():
	return dict(err_blueprint_name=mod.name)


@mod.app_errorhandler(403)
def abort_403(e):
	return render_template(mod.name + '/403.html', title='403'), 403


@mod.app_errorhandler(404)
def abort_404(e):
	return render_template(mod.name + '/404.html', title='404'), 404


@mod.app_errorhandler(500)
def abort_500(e):
	return render_template(mod.name + '/500.html', title='500'), 500


@mod.route('/403')
def error_page_403():
	return abort(403)


@mod.route('/404')
def error_page_404():
	return abort(404)


@mod.route('/500')
def error_page_500():
	return abort(500)
