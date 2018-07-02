from flask import Flask, redirect, url_for, current_app
from flask_dance.contrib.azure import make_azure_blueprint


# azure_app_id = current_app.config['AZURE_APP_ID']
# azure_app_pwd = current_app.config['AZURE_APP_PWD']
# bp = make_azure_blueprint(client_id=azure_app_id, client_secret=azure_app_pwd)
