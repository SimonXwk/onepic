from app.blueprints.helpers import create_blueprint
from .url_map import map_urls as route

mod = create_blueprint('dictionary', __name__)
route(mod)
