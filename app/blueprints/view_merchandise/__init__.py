from app.blueprints.helpers import create_blueprint
from .routes import route

mod = create_blueprint('merchandise', __name__)
route(mod)
