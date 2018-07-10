from werkzeug.contrib.cache import SimpleCache

cache = SimpleCache()


def cached_key(endpoint, calc_name, *parameters):
	return '.'.join((endpoint, calc_name, *parameters))
