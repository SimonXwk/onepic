from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask import session, request, redirect
from app.user import User, anonymous_user
from flask_sslify import SSLify


db = SQLAlchemy()
login_manager = LoginManager()
sslify = SSLify()


def init_app_extensions(app):
	db.init_app(app)
	login_manager.init_app(app)
	sslify.init_app(app)


@login_manager.user_loader
def load_user(identity):
	if identity == 'anonymous':
		return anonymous_user
	user = User(session[identity])
	return user


@login_manager.unauthorized_handler
def unauthorized_callback():
	return redirect('/auth_azure?next=' + request.path)

