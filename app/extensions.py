from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()


class User:

	def get_id(self):
		pass

	def is_authenticated(self):
		pass

	def is_active(self):
		""""""
		# True: Assume all users are active
		return True

	def is_anonymous(self):
		""""""
		# False: Anonymous users aren't supported
		return False


@login_manager.user_loader
def load_user(user_id):
	"""
	:param user_id: user_id (email) user to retrieve
	:return: the associated User object by given user_id
	"""
	return User.get(user_id)


def init_app_extensions(app):
	db.init_app(app)
	login_manager.init_app(app)
