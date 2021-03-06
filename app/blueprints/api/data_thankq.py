from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
from app.api import ApiResult, ApiException
from app.helper import request_arg
import app.tests as tests
import functools
import datetime


# The * in the argument list means that the remaining arguments can’t be called as positional arguments
def odbc_json_api(_func=None, *, orient='records', dump=False):
	def decorator(f):
		@functools.wraps(f)
		def decorated_function(*args, **kwargs):
			odbc_result = f(*args, **kwargs)
			return ApiResult(odbc_result.to_json(orient=orient), dump=dump)
		return decorated_function

	if _func is None:
		return decorator
	else:
		return decorator(_func)


@odbc_json_api
def payments():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	d1, d2 = Tq.format_date(TLMA.fy_range(fy))
	# d1 = request_arg('fy', Tq.format_date(TLMA.fy_range(TLMA.cfy)[0]), lambda x: tests.is_valid_string(x, max_length=10))
	# d2 = request_arg('fy', Tq.format_date(TLMA.fy_range(TLMA.cfy)[1]), lambda x: tests.is_valid_string(x, max_length=10))
	updates = [('BASE_QUERY', ''), ('PAYMENT_DATE1', d1, '\''), ('PAYMENT_DATE2', d2, '\'')]
	return Tq.query(('CTE', 'CTE_PAYMENTS'), cached_timeout=60, updates=updates)
	# return Tq.query('PAYMENTS', cached_timeout=120, updates=updates)


@odbc_json_api
def merch_activities():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	d1, d2 = Tq.format_date(TLMA.fy_range(fy))
	updates = [('BASE_QUERY', ''), ('PAYMENT_DATE1', d1, '\''), ('PAYMENT_DATE2', d2, '\'')]
	return Tq.query(('CTE', 'CTE_MERCH_ACTIVITY_SUMMARY'), cached_timeout=60, updates=updates)


@odbc_json_api
def fys_summary():
	ltd = request_arg('ltd', 0, type_func=int, test_func=lambda x: tests.is_int(x) and (int(x) == 0 or int(x) == -1))
	params = (TLMA.cfy, ltd)
	return Tq.query('FY_SUMMARY', *params, cached_timeout=30)


@odbc_json_api
def marketing_cycle():
	updates = (('BASE_QUERY', ''),)
	return Tq.query(('CTE', 'CTE_MARKETING_CYCLE'), cached_timeout=10, updates=updates)


@odbc_json_api
def source_code1_summary():
	s1 = request_arg('s1', '', test_func=lambda x: tests.is_valid_string(x, nosql=True, max_length=30))
	updates = [('SOURCECODE1', s1, '\'')]
	return Tq.query('_SINGLE_SOURCECODE_SUMMAY', cached_timeout=30, updates=updates)


@odbc_json_api(orient='columns')
def contact_created_fy():
	return Tq.query('STATS_CONTACTS_CREATED_FY', cached_timeout=60)


@odbc_json_api
def new_customer_list():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	d1, d2 = TLMA.fy_range(fy)
	# params = (Tq.format_date(d1), Tq.format_date(d2))
	updates = [('DATE_START', Tq.format_date(d1), '\''), ('DATE_END', Tq.format_date(d2), '\'')]
	return Tq.query('JOURNEY_NEW_MERCHANDISE_CUSTOMER', cached_timeout=10, updates=updates)


@odbc_json_api
def journey_cureone_acquisiton_donors():
	campaign_code = request_arg('camapgincode', '%19AC.Cure%One%Acquisition%', test_func=lambda x: tests.is_valid_string(x, nosql=True, max_length=30))
	updates = [('CAMPAIGN_CODE', campaign_code, '\'')]
	return Tq.query('JOURNEY_CUREONE_ACQUISITON_DONORS', cached_timeout=10, updates=updates)


@odbc_json_api
def get_first_date_source1_by_contacts_since():
	sn = request_arg('sn', '', test_func=lambda x: tests.is_valid_string(x, max_length=7))
	since = request_arg('since', Tq.format_date(TLMA.fy_range(TLMA.cfy)[0]), test_func=lambda x: tests.is_valid_string(x, max_length=10))
	return Tq.query('CONTACTS_FIRSTDAY_SOURCECODES_SINCE', sn, since, cached_timeout=120)


@odbc_json_api
def christmas_appeal_donors():
	return Tq.query('JOURNEY_CHRISTMAS_APPEAL_DONORS', cached_timeout=20)


# Pledge Related
@odbc_json_api
def pledge_headers():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	updates = (('PLEDGE_CREATED_FY', fy), ('BASE_QUERY', ''))
	return Tq.query(('CTE', 'CTE_PLEDGE'), cached_timeout=30, updates=updates)


# Pledge Related
@odbc_json_api
def pledge_types():
	updates = [('BASE_QUERY_TABLE', 'cte_pledge_types')]
	return Tq.query('CTE', cached_timeout=30, updates=updates)


@odbc_json_api
def fishing_pool():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	d1, d2 = TLMA.fy_range(fy)
	updates = (('BASE_QUERY', ''), ('FISHINGPOOL_DATE1', Tq.format_date(d1 - datetime.timedelta(days=1)), '\''), ('FISHINGPOOL_DATE2', Tq.format_date(datetime.date.today()), '\''))
	return Tq.query(('CTE', 'CTE_FISHING_POOL'), cached_timeout=60, updates=updates)


@odbc_json_api
def fishing_pool_sankey():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	d1, d2 = TLMA.fy_range(fy)
	updates = (('BASE_QUERY', ''), ('FISHINGPOOL_DATE1', Tq.format_date(d1 - datetime.timedelta(days=1)), '\''), ('FISHINGPOOL_DATE2', Tq.format_date(datetime.date.today()), '\''))
	return Tq.query(('CTE', 'CTE_FISHING_POOL_SANKEY'), cached_timeout=30, updates=updates)
