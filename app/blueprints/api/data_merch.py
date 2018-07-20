import datetime
import calendar
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
from app.api import ApiResult, ApiException
from app.blueprints.view_merchandise.rfm_calc import RFM


def new_fy(fy=None):
	results = {}

	if fy is None:
		raise ApiException('You must provide a 4 digit financial year number !')
	elif len(str(fy).strip()) != 4:
		raise ApiException('A 4 digit financial year number is required.')
	else:
		try:
			fy = int(fy)
		except ValueError:
			raise ApiException('An integer representing a financial year is required for the desired result')
		date1, date2 = TLMA.fy_range(fy)
		params = (Tq.format_date(date1), Tq.format_date(date2))
		rows = Tq.query('NEW_CUSTOMER', *params, cached_timeout=10).rows
		fystr = 'FY' + str(fy)
		results[fystr] = []
		for r in rows:
			results[fystr].append({
				'searialNumber': r[0],
				'firstDate': r[1],
				'firstOrder': r[2],
				'firstOrderSource':r.FIRST_ORDER_SOURCE
			})
	return ApiResult(results)


def new_cfy_month(month=None):
	if month is not None and (int(month) < 1 or int(month) > 12):
		return ApiException('An integer between 1 and 12 representing a month in current financial year is required')
	else:
		results = {}

		date1, date2 = TLMA.cy_month_range(TLMA.cy(TLMA.cfy, TLMA.fy_mth(month)), month)

		params = (Tq.format_date(date1), Tq.format_date(date2))
		rows = Tq.query('NEW_CUSTOMER', *params, cached_timeout=10).rows
		fystr = 'FY' + str(TLMA.cfy)
		results[fystr] = []
		for r in rows:
			results[fystr].append({
				'searialNumber': r[0],
				'firstDate': r[1],
				'firstOrder': r[2],
				'firstOrderSource': r.FIRST_ORDER_SOURCE
			})

		# return results
		return ApiResult(results)


def rex_rfm(filename=None):
	data = RFM(filename).analysis()
	return ApiResult(data)
