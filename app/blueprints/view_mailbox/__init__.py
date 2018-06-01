from app.blueprints.helpers import create_blueprint
from .url_map import map_urls


mod = create_blueprint('mailbox', __name__)
map_urls(mod)
