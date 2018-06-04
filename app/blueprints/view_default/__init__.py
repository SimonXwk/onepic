from app.blueprints.helpers import create_blueprint
from .url_map import map_urls as route
from .jinja_filters import add_jinja2_filters

mod = create_blueprint('default', __name__, prefixed=False)
route(mod)
add_jinja2_filters(mod)


# App context
@mod.app_context_processor
def inject_now():
	from datetime import datetime
	return dict(now=datetime.now())


@mod.app_context_processor
def inject_hostname():
	from socket import gethostname
	return dict(hostname=gethostname())
