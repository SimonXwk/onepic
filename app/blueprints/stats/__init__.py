from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.contacts_snapshot', url_rules=['/contacts_snapshot']),
	dict(import_name='view_funcs.fishing_pool', url_rules=['/fishing_pool']),
	dict(import_name='view_funcs.segments', url_rules=['/segments']),
	dict(import_name='view_funcs.donor_types', url_rules=['/donor_types']),
)
bp.register_lazy_urls(view_funcs_list)
