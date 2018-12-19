from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.merchandise_revenue_overview', url_rules=['/merchandise_revenue_overview']),
	dict(import_name='view_funcs.merchandise_activity', url_rules=['/merchandise_activity']),
	dict(import_name='view_funcs.track_shipped_order', url_rules=['/track_shipped_order']),
	dict(import_name='view_funcs.list_unshipped_orders', url_rules=['/list_unshipped_orders']),
	dict(import_name='view_funcs.rfm_result', url_rules=['/rfm/result/<filename>'], endpoint='rfm_result'),
	dict(import_name='view_funcs.upload', url_rules=['/rfm/upload'], methods=['GET', 'POST']),
	dict(import_name='view_funcs.merchandise_new_courtesy_call', url_rules=['/merchandise_new_courtesy_call']),
	dict(import_name='view_funcs.merchandise_new_welcome_pack', url_rules=['/merchandise_new_welcome_pack']),

)
bp.register_lazy_urls(view_funcs_list)
