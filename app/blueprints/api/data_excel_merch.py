from app.api import ApiResult, ApiException
from app.helper import request_arg
import app.tests as tests
from app.blueprints.view_merchandise.rfm_calc import RFM
from app.blueprints.view_merchandise.fulfilment import list_all_files, read_one_slip


def rex_rfm(filename=None):
	data = RFM(filename).analysis()
	return ApiResult(data)


def rex_fulfilment_excels():
	data = list_all_files()
	return ApiResult(data)


def rex_picking_slip():
	filename = request_arg('filename', '*', tests.is_valid_string)
	tab = request_arg('tab', None, tests.is_valid_string)
	data = read_one_slip(filename, tab)
	return ApiResult(data)
