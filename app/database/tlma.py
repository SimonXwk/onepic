import datetime
import calendar
import re

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
	acquisition_cost = {
		'FY': {
			2019: {
				'Merchandise': {
					'19AC.M NRMA': {'PRODUCTION_COST': 61335, 'PRINTED': 1420000, 'PRINTING_COST': 69604.36},
					'19AC.M WomensWeekly': {'PRODUCTION_COST': 200, 'PRINTED': 5000, 'PRINTING_COST': 246.82},
					'19AC.M Probus': {'PRODUCTION_COST': 550, 'PRINTED': 5000, 'PRINTING_COST': 246.82}
				}

			}
		}
	}

	@classmethod
	def budget(cls):
		# todo: Change budget from dummy sample to real query
		# Fake Budget Data By Random Numbers
		budget_data = {
			'FY': {
				2017: {
					'TLMA': [101774.00, 252604.00, 291348.00, 288224.00, 237092.00, 331394.00, 146125.00, 265884.00, 274840.00, 306690.00, 427359.00, 526750.00],
					'PRIVATE': {
						'Fundraising': [66706.00, 131719.00, 134281.00, 244462.00, 183145.00, 195510.00, 134140.00, 170387.00, 152316.00, 189984.00, 313768.00, 419849.00],
						'Merchandise': [35068.00, 120885.00, 57067.00, 43762.00, 53947.00, 35884.00, 11985.00, 95497.00, 22524.00, 16706.00, 13591.00, 6901.00],
						'Bequest': [0, 0, 100000, 0, 0, 100000, 0, 0, 100000, 100000, 100000, 100000]
					}
				},
				2018: {
					'TLMA': [140019.17, 264309.84, 214326.44, 282776.48, 430085.79, 254985.92, 204881.35, 221952.54, 252638.82, 234580.96, 527200.13, 506402.84],
					'PRIVATE': {
						'Fundraising': [88775.88, 131905.51, 139756.32, 170051.83, 216918.68, 176172.16, 131784.80, 156216.90, 188260.00, 140202.15, 397569.33, 376772.04],
						'Merchandise': [51243.30, 102404.33, 44570.12, 82724.65, 123167.10, 48813.76, 43096.55, 35735.64, 34378.82, 34378.82, 9630.80, 9630.80],
						'Bequest': [0, 30000, 30000, 30000, 90000, 30000, 30000, 30000, 30000, 60000, 120000, 120000]
					}
				},
				2019: {
					'TLMA': [190680.43, 166230.42, 165560.77, 375593.77, 428979.81, 384917.04, 223673.79, 276580.74, 262926.02, 308699.07, 507547.75, 877721.99],
					'PRIVATE': {
						'Fundraising': [69885.61, 105411.72, 116839.60, 152246.05, 226588.11, 217862.86, 127638.68, 174329.95, 148603.96, 221951.01, 379793.29, 694835.78],
						'Merchandise': [110794.82, 50818.71, 38721.17, 213347.72, 192391.70, 117054.18, 46035.11, 52250.79, 64322.06, 36748.07, 27754.46, 32886.21],
						'Bequest': [10000, 10000, 10000, 10000, 10000, 50000, 50000, 50000, 50000, 50000, 100000, 150000],
						'MerchandiseGST': [6296.13, 2865.61, 2251.69, 10514.21, 9545.05, 6038.96, 2568.37, 3040.79, 3556.01, 2094.48, 780.92, 1193.72]
					},
					'CAMPAIGN': {
						'xxxxxxxxxxxxx': {
							'Merchandise Purchase': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Postage': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Donation': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Gift of Love': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Sponsorship': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						},
						'19PP.M GOL': {
							'Merchandise Purchase': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Postage': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Donation': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1500, 1500],
							'Merchandise Gift of Love': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13500, 13500],
							'Merchandise Sponsorship': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						},
						'19AC.M NRMA': {
							'Merchandise Purchase': [0, 0, 0, 18900, 25200, 18900, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Postage': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Donation': [0, 0, 0, 2100, 2800, 2100, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Gift of Love': [0, 0, 0, 8400, 11200, 8400, 0, 0, 0, 0, 0, 0, 0],
							'Merchandise Sponsorship': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						},
						'19PP.M WinterSpring': {
							'Merchandise Purchase': [56138.54, 24493.39, 16624.94, 9446.00, 3054.94, 927.78, 67.59, 99.41, 21.21, 0, 0, 0],
							'Merchandise Postage': [6315.59, 2755.51, 1870.31, 1062.68, 343.68, 104.37, 7.60, 11.18, 2.39, 0, 0, 0],
							'Merchandise Donation': [12380.55, 5401.67, 3666.39, 2083.18, 673.72, 204.61, 14.91, 21.92, 4.68, 0, 0, 0],
							'Merchandise Gift of Love': [27066.80, 11809.31, 8015.60, 4554.32, 1472.92, 447.32, 32.59, 47.93, 10.23, 0, 0, 0],
							'Merchandise Sponsorship': [900.00, 934.92, 968.79, 965.65, 530.60, 527.64, 92.77, 89.99, 87.29, 84.67, 82.13, 79.67]
						},
						'19PP.M Christmas': {
							'Merchandise Purchase': [0, 0, 100.69, 62206.64, 54790.71, 29728.72, 1733.87, 285.04, 194.32, 0, 0, 0],
							'Merchandise Postage': [0, 0, 13.79, 8519.61, 7503.95, 4071.54, 237.47, 39.04, 26.61, 0, 0, 0],
							'Merchandise Donation': [0, 0, 43.78, 27082.37, 23892.97, 13030.32, 855.51, 222.53, 180.13, 92.77, 89.99, 87.29],
							'Merchandise Gift of Love': [0, 0, 80.99, 50035.78, 44070.79, 23912.23, 1394.64, 229.27, 156.30, 0, 0, 0],
							'Merchandise Sponsorship': [108, 108, 108, 1404, 1836, 972, 108, 108, 108, 108, 108, 108]
						},

					}
				}
			}
		}
		return budget_data

	@classmethod
	def get_fy_month_list(cls):
		if cls.fy1m == 1:
			return [i for i in range(1, 13)]
		return [(cls.fy1m + i) if (cls.fy1m + i) < 13 else (cls.fy1m + i - 12) for i in range(12)]

	@classmethod
	def set_fy1m(cls, month):
		cls.fy1m = month if isinstance(month, int) and month in range(1, 13) else cls.fy1m

	@classmethod
	def fy_range(cls, fy):
		return datetime.date(cls.cy(fy, 1), cls.fy1m, 1), (datetime.date(cls.cy(fy, 12), cls.fy1m, 1) - datetime.timedelta(days=1))

	@classmethod
	def cy(cls, fy, fy_month):
		return fy if fy_month >= cls.fy1m else fy - 1

	@classmethod
	def cy_month_range(cls, cy, cy_month):
		date1 = datetime.date(cy, cy_month, 1)
		date2 = datetime.date(cy, cy_month, calendar.monthrange(cy, cy_month)[1])
		return date1, date2

	@classmethod
	def ccy(cls, fy_month):
		return cls.cfy_start_date.year if fy_month < cls.fy1m or fy_month == 1 else cls.cfy_start_date.year + 1

	@classmethod
	def ccy_date(cls, fy_month, day):
		return datetime.date(cls.ccy(fy_month), fy_month, day)

	@classmethod
	def fy(cls, date):
		return int(date.year + (0 if date.month < cls.fy1m or cls.fy1m == 1 else 1))

	@classmethod
	def fy_mth(cls, cy_month):
		return cy_month + (cls.fy1m - 1 if cy_month < cls.fy1m or cls.fy1m == 1 else 1 - cls.fy1m)
