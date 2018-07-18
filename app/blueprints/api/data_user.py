from app.api import ApiResult, ApiException
from flask_login import current_user


def get_current_user():
	if current_user.is_authenticated:
		return ApiResult(dict(status='authenticated', user=current_user.user_dict))
	return ApiResult(dict(status='not authenticated', user=dict(name='anonymous')))
