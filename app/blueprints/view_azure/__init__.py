from flask import redirect, url_for, current_app, flash, session, request
from flask_dance.contrib.azure import make_azure_blueprint, azure
from oauthlib.oauth2.rfc6749.errors import TokenExpiredError, InvalidGrantError
from flask_login import login_user
from app.user import User

azure_app_id = current_app.config['AZURE_APP_ID']
azure_app_pwd = current_app.config['AZURE_APP_PWD']

bp = make_azure_blueprint(client_id=azure_app_id, client_secret=azure_app_pwd, redirect_to='default.logged')


@bp.route("/auth_azure", methods=['GET', 'POST'])
def login_azure():
	if not azure.authorized:
		return redirect(url_for("azure.login"))
	try:
		resp = azure.get("/v1.0/me")
		assert resp.ok
	except (InvalidGrantError, TokenExpiredError):
		return redirect(url_for("azure.login"))  # Todo: Investigate more on  https://github.com/singingwolfboy/flask-dance/issues/35

	resp_json = resp.json()
	# print(f'Logged User Response:\n{resp_json}')
	user = {
		'id': resp_json["id"],
		'name': resp_json["displayName"],
		'email': resp_json["mail"],
		'given_name': resp_json["givenName"],
		'surname': resp_json["surname"],
		'job_title': resp_json["jobTitle"],
		'office': resp_json["officeLocation"],
		'language': resp_json["preferredLanguage"],
		'principal_name': resp_json["userPrincipalName"],
		'business_phones': resp_json["businessPhones"],
		'mobile_phone': resp_json["mobilePhone"],
		'odata_context': resp_json["@odata.context"]
	}

	if not user['email'] or user['email'].rsplit('@', 1)[1] != 'tlma.online':
		return redirect(url_for("azure.login"))

	authenticated_user = User(user)
	login_user(authenticated_user)
	flash("Successfully signed in with Azure.")

	session[user['id']] = user
	# print(session[user['id']])

	next_url = request.args.get('next')
	if next_url:
		print(f'OAuth finished, now going back to {next_url}')
		return redirect(next_url)
	return redirect(url_for("default.logged"))
