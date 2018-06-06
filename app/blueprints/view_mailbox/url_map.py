from . import view_funcs as views


def map_urls(mod):
	mod.add_url_rule('/', endpoint='index', view_func=views.today)

	mod.add_url_rule('/today', view_func=views.daily)
	mod.add_url_rule('/daily', view_func=views.daily)
	mod.add_url_rule('/monthly', view_func=views.monthly)
	mod.add_url_rule('/excels', view_func=views.excel_list)
	mod.add_url_rule('/excels/download/<string:filename>', view_func=views.excel_download)
