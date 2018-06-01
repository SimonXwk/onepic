from flask import Blueprint
from .routes import route

mod_name = 'error'
mod = Blueprint(mod_name, __name__, static_folder='static', template_folder='templates', url_prefix='/'+mod_name)

route(mod)
