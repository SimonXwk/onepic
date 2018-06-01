import os


# Default Configuration (inheriting from object is not necessary in python3)
class BaseConfig(object):
	""" Builtin Value Configurations
	"""
	DEBUG = False
	TESTING = False
	SECRET_KEY = 'you-will-never-guess'

	""" General Value Configurations
	"""
	# Define the application directory
	BASE_DIR = os.path.abspath(os.path.dirname(__file__))
	# Define the database directory
	DATABASE_URI = 'sqlite://:memory:'


class ExtensionConfig(BaseConfig):
	""" Flask-SQLAlchemy Configurations
	"""
	# TODO(delete this): SQLALCHEMY_TRACK_MODIFICATIONS adds significant overhead and will be disabled by default in the future. Set it to True or False to suppress this warning.
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	SQLALCHEMY_DATABASE_URI = 'mssql+pyodbc://usr:pwd@server/db?driver=SQL+Server'


class CustomConfig(ExtensionConfig):
	""" Configurations only apply to this application
	"""

	""" ThnakQ ODBC Connection String
	"""
	TQ_ODBC_CONNECTION_STRING = 'DRIVER={SQL Server};SERVER=xxx.xxx.xxx.xxx;DATABASE=xxx_xxx;UID=xxx;PWD=xxx'

	""" Mail Opening Location
	"""

	DAILY_MAIL_DATA_RANGE = 'B3:S33'

	""" TLMA DICTIONARY
	"""
	TLMA_FY1M = 7  # Number in range [1,12] without leading zero

	""" Merchandise RFM
	"""
	ALLOWED_EXTENSIONS = {'csv', 'tsv'}
	RFM_SECTOR_SEP = '_'
	RFM_SCORE_SEP = '-'


# Development Configuration
class DevelopmentConfig(CustomConfig):
	# Statement for enabling the development environment
	DEBUG = True
	TESTING = False
	ASSETS_DEBUG = False


# Production Configuration
class ProductionConfig(CustomConfig):
	# Making sure that development/Testing environment are disabled
	DEBUG = False
	TESTING = False
	ASSETS_DEBUG = False


# Testing Configuration
class TestingConfig(CustomConfig):
	# Statement for enabling the testing environment
	DEBUG = False
	TESTING = True
	ASSETS_DEBUG = False


app_config_dict = {
	'development': DevelopmentConfig,
	'production': ProductionConfig,
	'testing': TestingConfig
}
