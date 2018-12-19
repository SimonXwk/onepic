from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.scoping_fy20', url_rules=['/scoping_fy20']),
	dict(import_name='view_funcs.chart_of_account', url_rules=['/chart_of_account']),
	dict(import_name='view_funcs.classes', url_rules=['/classes']),
	dict(import_name='view_funcs.load_reckon_data', url_rules=['/load_reckon_data']),
)
bp.register_lazy_urls(view_funcs_list)
