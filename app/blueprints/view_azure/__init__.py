from flask import redirect, url_for, session, current_app
from flask_dance.contrib.azure import make_azure_blueprint, azure

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
	user = {
		'id': resp_json["id"],
		'display': resp_json["displayName"],
		'given_name': resp_json["givenName"],
		'surname': resp_json["surname"],
		'email': resp_json["mail"],
		'job_title': resp_json["jobTitle"],
		'offcie': resp_json["officeLocation"],
	}
	print(resp)
	print(resp_json)
	session['user_name'] = user["display"]
	return redirect(url_for("default.logged"))
