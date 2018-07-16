from functools import wraps
from werkzeug.contrib.cache import SimpleCache
import hashlib
import pickle
import inspect


cache = SimpleCache()


def simple_cache_key(endpoint, func_name, *parameters):
	return '.'.join((endpoint, func_name, *parameters))


def compute_cache_key(func, args, kwargs):
	key = pickle.dumps((func.__name__, args, kwargs))
	return hashlib.sha1(key).hexdigest()


def get_args(func):
	signature = inspect.signature(func)
	return [parameter.name for parameter in signature.parameters.values() if parameter.kind == parameter.POSITIONAL_OR_KEYWORD]


def cached(cached_timeout=2*60):
	def decorator(f):
		@wraps(f)
		def decorated_function(*args, **kwargs):
			calc_key = '.'.join((f.__module__, f.__name__, *tuple(get_args(f))))
			cache_key = compute_cache_key(f, args, kwargs)
			result = cache.get(cache_key)
			if result is not None:
				print('*** {{cache}} * <{} seconds, {}> retrieved for [{}]'.format(cached_timeout, cache_key, calc_key))
				return result
			result = f(*args, **kwargs)
			cache.set(cache_key, result, timeout=cached_timeout)
			print('*** {{cache}} * <{} seconds, {}> recalculated for [{}]'.format(cached_timeout, cache_key, calc_key))
			return result
		return decorated_function
	return decorator
