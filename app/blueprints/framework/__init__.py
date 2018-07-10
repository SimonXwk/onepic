from flask import current_app
from .bootstrap import Bootstrap

bp = Bootstrap(current_app._get_current_object()).to_blueprint()
