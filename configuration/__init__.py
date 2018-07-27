# Default Configuration (inheriting from object is not necessary in python3)
class BaseConfig(object):
	""" Builtin Value Configurations
	"""
	SECRET_KEY = 'this-is-an-absolute-secret-or-not'


class ExtensionConfig(BaseConfig):
	""" Flask-SQLAlchemy Configurations
	"""
	# TODO(delete this): SQLALCHEMY_TRACK_MODIFICATIONS adds significant overhead and will be disabled by default in the future. Set it to True or False to suppress this warning.
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	SQLALCHEMY_DATABASE_URI = 'mssql+pyodbc://usr:pwd@server/db?driver=SQL+Server'


class CustomConfig(ExtensionConfig):
	""" Configurations only apply to this application
	"""
	""" Bootstrap Configuration
	"""
	BOOTSTRAP_SERVE_LOCAL = False

	BOOTSTRAP_USE_PACKAGE_JSON_VERSION = False
	BOOTSTRAP_VERSION = '4.1.3'
	BOOTSTRAP_JQUERY_VERSION = '3.3.1'
	BOOTSTRAP_POPPER_VERSION = '1.14.1'

	BOOTSTRAP_JS_CDN = 'https://maxcdn.bootstrapcdn.com/bootstrap/{}/js/bootstrap.min.js'
	BOOTSTRAP_JQUERY_CDN = 'https://ajax.googleapis.com/ajax/libs/jquery/{}/jquery.min.js'
	BOOTSTRAP_POPPER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/{}/umd/popper.min.js'

	""" HighChart Configuration
	"""
	HIGHCHART_SERVE_LOCAL = False
	HIGHCHART_LOCAL_JS_PATH = 'vendor/hc/{}.js'

	HIGHCHART_USE_PACKAGE_JSON_VERSION = True
	HIGHCHART_VERSION = '6.1.1'

	# Check http://code.highcharts.com/
	HIGHCHART_BASE_CDN = 'http://code.highcharts.com/{}/{}.js'
	HIGHCHART_MODLUE_CDN = 'https://code.highcharts.com/{}/modules/{}.js'

	HIGHSTOCK_BASE_CDN = 'http://code.highcharts.com/stock/{}/{}.js'
	HIGHSTOCK_MODLUE_CDN = 'http://code.highcharts.com/stock/{}/modules/{}.js'

	HIGHMAP_BASE_CDN = 'http://code.highcharts.com/maps/{}/{}.js'
	HIGHMAP_MODLUE_CDN = 'http://code.highcharts.com/maps/{}/modules/{}.js'

	""" Chart.js Configuration
		"""
	CHARTJS_SERVE_LOCAL = False
	CHARTJS_USE_PACKAGE_JSON_VERSION = True

	CHARTJS_VERSION = '2.7.2'
	CHARTJS_BASE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/{}/Chart.bundle.min.js'

	""" ThnakQ ODBC Connection String
	"""
	TQ_ODBC_CONNECTION_STRING = 'DRIVER={SQL Server};SERVER=xxx.xxx.xxx.xxx;DATABASE=xxx_xxx;UID=xxx;PWD=xxx'

	""" Mail Opening Location
	"""
	DAILY_MAIL_DATA_RANGE = 'B3:S33'

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


# Production Configuration
class ProductionConfig(CustomConfig):
	# Making sure that development/Testing environment are disabled
	DEBUG = False
	TESTING = False


# Testing Configuration
class TestingConfig(CustomConfig):
	# Statement for enabling the testing environment
	DEBUG = False
	TESTING = True


app_config_dict = {
	'base': CustomConfig,
	'development': DevelopmentConfig,
	'production': ProductionConfig,
	'testing': TestingConfig
}
