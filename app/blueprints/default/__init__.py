from app.blueprints import MyBlueprint
from app.helper import use_template


bp = MyBlueprint(__name__, has_url_prefix=False)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.index', url_rules=['/'], endpoint='index'),
	dict(import_name='view_funcs.test', url_rules=['/test']),
	dict(import_name='view_funcs.logged', url_rules=['/logged']),
	dict(import_name='view_funcs.login', url_rules=['/login'], methods=['POST']),
	dict(import_name='view_funcs.login_as_guest', url_rules=['/login_as_guest']),
	dict(import_name='view_funcs.logout', url_rules=['/logout']),
	dict(import_name='view_funcs.use_thankq_live_reporter', url_rules=['/use_thankq_live_reporter']),
	dict(import_name='view_funcs.use_thankq_replicate_reporter', url_rules=['/use_thankq_replicate_reporter']),
	dict(import_name='view_funcs.error_page_403', url_rules=['/403']),
	dict(import_name='view_funcs.error_page_404', url_rules=['/404']),
	dict(import_name='view_funcs.error_page_500', url_rules=['/500']),
)
bp.register_lazy_urls(view_funcs_list)

# Add App Level Context_Processors
bp.register_lazy_app_context_processors((
	'context_processors.inject_now',
	'context_processors.inject_cfy',
	'context_processors.inject_thankq_data_source',
	'context_processors.inject_fy_month_list',
	'context_processors.utility_processor',
))

# Add App Level Jinja Custom Template Filters
bp.register_lazy_filters((
	dict(import_name='jinja_filters.format_currency', name='currency'),
	dict(import_name='jinja_filters.format_number', name='number'),
	dict(import_name='jinja_filters.division', name='div'),
	dict(import_name='jinja_filters.percentage', name='pct'),
	dict(import_name='jinja_filters.format_datetime_au', name='dtAU'),
	dict(import_name='jinja_filters.format_date_au', name='dAU'),
	dict(import_name='jinja_filters.format_date_sort', name='dSort'),
	dict(import_name='jinja_filters.format_datetime_sort', name='dtSort'),
	dict(import_name='jinja_filters.filter_month_name', name='mthname'),
	dict(import_name='jinja_filters.filter_add_working_days', name='addworkingdays'),
	dict(import_name='jinja_filters.filter_to_date', name='strpdt'),
	dict(import_name='jinja_filters.filter_financial_year', name='FY'),
	dict(import_name='jinja_filters.financial_year_month', name='fymth'),
	dict(import_name='jinja_filters.filter_datetime_offset', name='dtOffset'),
	dict(import_name='jinja_filters.filter_filename', name='fname'),
	dict(import_name='jinja_filters.filter_mail_excel_month', name='mailmonth'),
))


""" Non-Lazy Registration :
There's no Non-decorator version of app_errorhandler(). 
the register_error_handler() is non-decorator version of errorhandler(), and
this Blueprint function is for error handlers limited to the blueprint itself
"""


@bp.app_errorhandler(403)
@use_template('/'.join((bp.name, '403')), title='403', status=403, template_path_absolute=True)
def abort_403(e): pass


@bp.app_errorhandler(404)
@use_template('/'.join((bp.name, '404')), title='404', status=404, template_path_absolute=True)
def abort_404(e): pass


@bp.app_errorhandler(500)
@use_template('/'.join((bp.name, '500')), title='500', status=500, template_path_absolute=True)
def abort_500(e): pass
