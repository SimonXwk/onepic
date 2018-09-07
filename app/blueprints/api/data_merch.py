from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
from app.api import ApiResult, ApiException
from app.helper import request_arg
import app.tests as tests
from app.blueprints.view_merchandise.rfm_calc import RFM


def rex_rfm(filename=None):
	data = RFM(filename).analysis()
	return ApiResult(data)


def new_customer_list():
	fy = int(request_arg('fy', TLMA.cfy, tests.is_year))
	d1, d2 = TLMA.fy_range(fy)
	# params = (Tq.format_date(d1), Tq.format_date(d2))
	updates = [('DATE_START', Tq.format_date(d1), '\''), ('DATE_END', Tq.format_date(d2), '\'')]
	results = Tq.query('JOURNEY_NEW_MERCHANDISE_CUSTOMER', cached_timeout=10, updates=updates)
	return ApiResult(results.to_json(), dump=False)
