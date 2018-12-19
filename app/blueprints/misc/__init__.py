from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='view_funcs.basic', url_rules=['/basic']),
	dict(import_name='view_funcs.marketing_cycle', url_rules=['/marketing_cycle']),
	dict(import_name='view_funcs.questions', url_rules=['/questions']),

)
bp.register_lazy_urls(view_funcs_list)
