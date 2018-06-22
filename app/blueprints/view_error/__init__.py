from flask import render_template, abort
from app.helpers import create_blueprint

bp = create_blueprint('error', __name__)


# This context is needed for template to know about the blueprint.
# Request object is not available when abort happens(you can not use {{request.blueprint}} in templates)
@bp.app_context_processor
def inject_error_blueprint_name():
	return dict(err_blueprint_name=bp.name)


@bp.app_errorhandler(403)
def abort_403(e):
	return render_template(bp.name + '/403.html', title='403'), 403


@bp.app_errorhandler(404)
def abort_404(e):
	return render_template(bp.name + '/404.html', title='404'), 404


@bp.app_errorhandler(500)
def abort_500(e):
	return render_template(bp.name + '/500.html', title='500'), 500


@bp.route('/403')
def error_page_403():
	return abort(403)


@bp.route('/404')
def error_page_404():
	return abort(404)


@bp.route('/500')
def error_page_500():
	return abort(500)
