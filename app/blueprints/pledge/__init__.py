from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.lifecycle', url_rules=['/lifecycle']),
	dict(import_name='view_funcs.overview', url_rules=['/overview']),
	dict(import_name='view_funcs.fy_monthly', url_rules=['/fy_monthly']),
	dict(import_name='view_funcs.pledges', url_rules=['/pledges']),
	dict(import_name='view_funcs.pledge_income_fy', url_rules=['/pledge_income_fy']),
	dict(import_name='view_funcs.delinquency', url_rules=['/delinquency']),
)
bp.register_lazy_urls(view_funcs_list)
