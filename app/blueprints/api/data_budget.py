from app.database.tlma import TLMA
from app.api import ApiResult, ApiException
from app.helper import request_arg
import app.tests as tests


def budget():
	return ApiResult(TLMA.budget())
