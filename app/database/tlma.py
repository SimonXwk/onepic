import datetime

FIRST_FY_MONTH_DEFAULT = 7


class TLMA:
	fy1m = FIRST_FY_MONTH_DEFAULT
	fy12m = 12 if fy1m == 1 else fy1m - 1
	cfy = int(datetime.date.today().year + (0 if datetime.date.today().month < fy1m or fy1m == 1 else 1))
	cfy_start_date = datetime.date(datetime.date.today().year - 1 if datetime.date.today().month < 7 else datetime.date.today().year, fy1m, 1)
	cfy_end_date = datetime.date(datetime.date.today().year if datetime.date.today().month < 7 else datetime.date.today().year + 1, fy1m, 1) - datetime.timedelta(days=1)
	marketing_cycle = [
		{'code': 'PP', 'sequence': 1, 'name': 'Prospecting', 'KPI': ['No.Reached']},
		{'code': 'AC', 'sequence': 2, 'name': 'Acquisition', 'KPI': ['No.New Contact']},
		{'code': 'DV', 'sequence': 3, 'name': 'Development', 'KPI': ['Strike Rate']},
		{'code': 'PM', 'sequence': 4, 'name': 'Promotion', 'KPI': []},
		{'code': 'DF', 'sequence': 5, 'name': 'Differentiation', 'KPI': []},
		{'code': 'RT', 'sequence': 6, 'name': 'Retention', 'KPI': ['ROI']},
		{'code': 'EG', 'sequence': 7, 'name': 'Engagement', 'KPI': []},
		{'code': 'RN', 'sequence': 8, 'name': 'Renewal', 'KPI': []},
		{'code': 'RA', 'sequence': 9, 'name': 'Reactivation', 'KPI': ['No.Recovered']}
	]

	@classmethod
	def set_fy1m(cls, month):
		cls.fy1m = month if isinstance(month, int) and month in range(1, 13) else cls.fy1m

	@classmethod
	def cy(cls, fy_month):
		return cls.cfy_start_date.year if fy_month < cls.fy1m or fy_month == 1 else cls.cfy_start_date.year + 1

	@classmethod
	def cy_date(cls, fy_month, day):
		return datetime.date(cls.cy(fy_month), fy_month, day)

	@classmethod
	def fy(cls, date):
		return int(date.year + (0 if date.month < cls.fy1m or cls.fy1m == 1 else 1))

	@classmethod
	def fy_mth(cls, date):
		return date.month + (cls.fy1m-1 if date.month < cls.fy1m or cls.fy1m == 1 else 1-cls.fy1m)
