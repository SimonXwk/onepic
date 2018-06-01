from . import view_funcs as views


def map_urls(mod):
	mod.add_url_rule('/', endpoint='index', view_func=views.homepage)
	mod.add_url_rule('/excels', view_func=views.excels)
