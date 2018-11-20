from app.api import ApiResult, ApiException
import app.database.iif as IIF


def chart_of_account():
	return ApiResult(IIF.get_account_list_of_dicts())


def classes():
	return ApiResult(IIF.get_class_list_of_dicts())
