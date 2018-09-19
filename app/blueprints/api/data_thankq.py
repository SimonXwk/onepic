from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
from app.api import ApiResult, ApiException
from app.helper import request_arg
import app.tests as tests


def payments():
	d1, d2 = TLMA.fy_range(TLMA.cfy)
	updates = [('PAYMENT_DATE1', Tq.format_date(d1), '\''), ('PAYMENT_DATE2', Tq.format_date(d2), '\'')]
	results = Tq.query('PAYMENTS', cached_timeout=120, updates=updates)
	return ApiResult(results.to_json(), dump=False)


def contact_created_fy():
	results = Tq.query('STATS_CONTACTS_CREATED_FY', cached_timeout=60)
	return ApiResult(results.to_json(orient='columns'), dump=False)


def new_customer_list():
	fy = int(request_arg('fy', TLMA.cfy, tests.is_year))
	d1, d2 = TLMA.fy_range(fy)
	# params = (Tq.format_date(d1), Tq.format_date(d2))
	updates = [('DATE_START', Tq.format_date(d1), '\''), ('DATE_END', Tq.format_date(d2), '\'')]
	results = Tq.query('JOURNEY_NEW_MERCHANDISE_CUSTOMER', cached_timeout=10, updates=updates)
	return ApiResult(results.to_json(), dump=False)


def journey_cureone_acquisiton_donors():
	campaign_code = request_arg('camapgincode', '%19AC.Cure%One%Acquisition%', lambda x: tests.is_valid_string(x, nosql=True, max_length=30))
	updates = [('CAMPAIGN_CODE', campaign_code, '\'')]
	results = Tq.query('JOURNEY_CUREONE_ACQUISITON_DONORS', cached_timeout=10, updates=updates)
	return ApiResult(results.to_json(), dump=False)