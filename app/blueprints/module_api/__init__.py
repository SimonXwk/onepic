from app.blueprints.helpers import create_blueprint
from .url_map import map_url as route


mod = create_blueprint('api', __name__)
route(mod)
