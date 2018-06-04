from . import view_funcs as views


def map_urls(mod):
	mod.add_url_rule('/', endpoint='index', view_func=views.homepage)
	mod.add_url_rule('/excels', view_func=views.excel_list)
	mod.add_url_rule('/excels/download/<string:filename>', view_func=views.excel_download)
