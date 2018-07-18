from app import create_app
from os import environ
from socket import gethostname

if __name__ == '__main__':
	environ.setdefault('FLASK_ENV', 'development')
	if gethostname().upper() == 'TLM-SHAREPOINT':
		environ.setdefault('FLASK_ENV', 'production')

	try:
		HOST = int(environ.get('SERVER_PORT', '0.0.0.0'))
	except ValueError:
		HOST = '0.0.0.0'

	try:
		PORT = int(environ.get('SERVER_PORT', '80'))
	except ValueError:
		PORT = 80

	environ.setdefault('OAUTHLIB_RELAX_TOKEN_SCOPE', '1')
	environ.setdefault('OAUTHLIB_INSECURE_TRANSPORT', '1')

	print("{}".format('-'*60))
	create_app().run(host=HOST, port=PORT)
