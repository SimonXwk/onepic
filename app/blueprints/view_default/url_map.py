from . import view_funcs as views


def map_urls(mod):
	mod.add_url_rule('/', view_func=views.index)
	mod.add_url_rule('/test', view_func=views.test)
	mod.add_url_rule('/login', view_func=views.login, methods=['POST'])
	mod.add_url_rule('/logout', view_func=views.logout)
