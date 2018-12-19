from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.overview', url_rules=['/'], endpoint='index'),
	dict(import_name='view_funcs.campaign_activity', url_rules=['/campaign_activity']),
	dict(import_name='view_funcs.comparative', url_rules=['/comparative']),
	dict(import_name='view_funcs.pending', url_rules=['/pending']),
	dict(import_name='view_funcs.sourcecode1_created', url_rules=['/sourcecode1_created']),
	dict(import_name='view_funcs.sourcecode1_active', url_rules=['/sourcecode1_active']),
	dict(import_name='view_funcs.revenue_streams', url_rules=['/revenue_streams']),
	dict(import_name='view_funcs.single_campaign', url_rules=['/single_campaign']),
)
bp.register_lazy_urls(view_funcs_list)
