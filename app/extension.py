from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, current_user
from app.user import users

db = SQLAlchemy()
login_manager = LoginManager()


def init_app_extensions(app):
	db.init_app(app)
	login_manager.init_app(app)


@login_manager.user_loader
def load_user(identity):
	return users[identity]
