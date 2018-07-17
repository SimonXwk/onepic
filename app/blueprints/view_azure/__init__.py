from flask import redirect, url_for, session, current_app, flash
from flask_dance.contrib.azure import make_azure_blueprint, azure
from app.extension import login_user
from app.user import users, User

azure_app_id = current_app.config['AZURE_APP_ID']
azure_app_pwd = current_app.config['AZURE_APP_PWD']

bp = make_azure_blueprint(client_id=azure_app_id, client_secret=azure_app_pwd)


@bp.route("/login_via_azure")
def login_azure():
	if not azure.authorized:
		return redirect(url_for("azure.login"))
	resp = azure.get("/v1.0/me")
	assert resp.ok
	resp_json = resp.json()
	print('Logged User Response:\n'.format(resp_json))
	user = {
		'id': resp_json["id"],
		'display': resp_json["displayName"],
		'email': resp_json["mail"],
		'given_name': resp_json["givenName"],
		'surname': resp_json["surname"],
		'job_title': resp_json["jobTitle"],
		'office': resp_json["officeLocation"],
	}
	if not user['email'] or user['email'].rsplit('@', 1)[1] != 'tlma.online':
		return redirect(url_for("azure.login"))
	logged_user = User(user['id'], user['display'], user['email'])
	login_user(logged_user)
	users[user['id']] = logged_user
	session['user_name'] = user["display"]
	session[user['id']] = True
	return redirect(url_for("default.logged"))
