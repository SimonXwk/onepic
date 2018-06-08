from app.blueprints.helpers import create_blueprint
from . import view_funcs as views
from .jinja_filters import add_jinja2_filters

mod = create_blueprint('default', __name__, prefixed=False)
add_jinja2_filters(mod)

mod.add_url_rule('/', view_func=views.index)
mod.add_url_rule('/test', view_func=views.test)
mod.add_url_rule('/login', view_func=views.login, methods=['POST'])
mod.add_url_rule('/logout', view_func=views.logout)


# App context
@mod.app_context_processor
def inject_now():
	from datetime import datetime
	return dict(now=datetime.now())
