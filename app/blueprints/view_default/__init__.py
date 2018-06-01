from flask import Blueprint
from .url_map import map_urls as route
from .jinja_filters import add_jinja2_filters

mod = Blueprint('default', __name__, static_folder='static', template_folder='templates', url_prefix=None)
route(mod)
add_jinja2_filters(mod)


# Blueprint context
@mod.context_processor
def inject_blueprint_name():
	return dict(blueprint_name=mod.name)


# App context
@mod.app_context_processor
def inject_now():
	from datetime import datetime
	return dict(now=datetime.now())


@mod.app_context_processor
def inject_hostname():
	from socket import gethostname
	return dict(hostname=gethostname())
