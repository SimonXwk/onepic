from app.api import ApiResult, ApiException
from app.blueprints.view_merchandise.rfm_calc import RFM
from app.blueprints.view_merchandise.fulfilment import list_all_files


def rex_rfm(filename=None):
	data = RFM(filename).analysis()
	return ApiResult(data)


def rex_fulfilment_excels():
	data = list_all_files()
	return ApiResult(data)
