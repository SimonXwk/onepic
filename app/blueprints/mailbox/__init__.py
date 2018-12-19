from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.today', url_rules=['/today'], endpoint='index'),
	dict(import_name='view_funcs.daily', url_rules=['/daily']),
	dict(import_name='view_funcs.monthly', url_rules=['/monthly']),
	dict(import_name='view_funcs.excel_list', url_rules=['/excels']),
	dict(import_name='view_funcs.excel_download', url_rules=['/excels/download/<string:filename>']),
)
bp.register_lazy_urls(view_funcs_list)
