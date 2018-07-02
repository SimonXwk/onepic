import datetime
import calendar
from app.database.odbc import ThankQODBC as tq
from app.api import ApiResult, ApiException
from app.blueprints.view_merchandise.rfm_calc import RFM


def new_fy(fy=None):
	results = {}
	if fy is None:
		raise ApiException('You must provide a 4 digit financial year number !')
	elif not isinstance(fy, int):
		raise ApiException('An integer representing a financial year is required for the desired result.')
	elif len(str(fy).strip()) != 4:
		raise ApiException('A 4 digit financial year number is required.')
	else:
		try:
			fy = int(fy)
			date1 = tq.date(datetime.date(fy-1, 7, 1))
			date2 = tq.date(datetime.date(fy, 6, 30))
			rows = tq.query('MERCH_NEW', date1, date2).rows
			fystr = 'FY' + str(fy)
			results[fystr] = []
			for r in rows:
				results[fystr].append({
					'searialNumber': r[0],
					'firstDate': r[1],
					'firstOrder': r[2]
				})
		except ValueError:
			raise ApiException('An integer representing a financial year is required for the desired result')
	return ApiResult(results)


def new_cfy_month(month=None):
	if month is not None and (int(month) < 1 or int(month) > 12):
		return ApiException('An integer between 1 and 12 representing a month in current financial year is required')
	else:
		results = {}
		month = datetime.date.today().month if month is None else month
		cy = datetime.date.today().year
		cfy = cy if datetime.date.today().month < 7 else cy + 1
		date1 = tq.date(datetime.date(cy if month < 7 else cy-1, month, 1))
		date2 = tq.date(datetime.date(cy if month < 7 else cy-1, month, calendar.monthrange(cy, month)[1]))
		rows = tq.query('MERCH_NEW', date1, date2).rows
		fystr = 'FY' + str(cfy)
		results[fystr] = []
		for r in rows:
			results[fystr].append({
				'searialNumber': r[0],
				'firstDate': r[1],
				'firstOrder': r[2]
			})

		# return results
		return ApiResult(results)


def rex_rfm(filename=None):
	data = RFM(filename).analysis()
	return ApiResult(data)
