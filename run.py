from app import create_app
from os import environ
from socket import gethostname

if __name__ == '__main__':
	HOST = environ.get('SERVER_HOST', '0.0.0.0')
	INSTANCE = 'development'
	try:
		PORT = int(environ.get('SERVER_PORT', '80'))
	except ValueError:
		PORT = 80

	if gethostname().upper() == 'TLM-SHAREPOINT':
		INSTANCE = 'production'

	print("{}".format('-'*60))
	create_app(INSTANCE).run(host=HOST, port=PORT)
