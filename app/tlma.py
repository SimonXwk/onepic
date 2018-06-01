from datetime import datetime
import configuration as config


class TLMA:
	first_fy_month_default = 7
	fy1m = config.CustomConfig.TLMA_FY1M
	first_fy_month = fy1m if isinstance(fy1m, int) and fy1m in range(1, 13) else first_fy_month_default
	current_fy = int(datetime.today().year + (0 if datetime.today().month < first_fy_month or first_fy_month == 1 else 1))

	@classmethod
	def fy(cls, date):
		return int(date.year + (0 if date.month < cls.first_fy_month or cls.first_fy_month == 1 else 1))

	@classmethod
	def fy_mth(cls, date):
		return date.month + (cls.fy1m-1 if date.month < cls.fy1m or cls.fy1m == 1 else 1-cls.fy1m)