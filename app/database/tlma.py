from datetime import datetime
import configuration as config


class TLMA:
	first_fy_month_default = 7
	fy1m = config.CustomConfig.TLMA_FY1M
	first_fy_month = fy1m if isinstance(fy1m, int) and fy1m in range(1, 13) else first_fy_month_default
	current_fy = int(datetime.today().year + (0 if datetime.today().month < first_fy_month or first_fy_month == 1 else 1))
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
	def fy(cls, date):
		return int(date.year + (0 if date.month < cls.first_fy_month or cls.first_fy_month == 1 else 1))

	@classmethod
	def fy_mth(cls, date):
		return date.month + (cls.fy1m-1 if date.month < cls.fy1m or cls.fy1m == 1 else 1-cls.fy1m)



