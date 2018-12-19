from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.cure_one', url_rules=['/cureone']),
	dict(import_name='view_funcs.cure_one_acquisition', url_rules=['/cureone_acquisition']),
	dict(import_name='view_funcs.general_new', url_rules=['/general_new']),
	dict(import_name='view_funcs.merchandise_new', url_rules=['/merchandise_new']),
	dict(import_name='view_funcs.touch_point_christmas_appeal', url_rules=['/touch_point_christmas_appeal']),
)
bp.register_lazy_urls(view_funcs_list)
