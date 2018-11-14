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
		{'code': 'PP', 'sequence': 1, 'name': 'Prospecting', 'KPI': ['Cost per Name']},
		{'code': 'AC', 'sequence': 2, 'name': 'Acquisition', 'KPI': ['Cost per Name']},
		{'code': 'DV', 'sequence': 3, 'name': 'Development', 'KPI': ['ROI']},
		{'code': 'PM', 'sequence': 4, 'name': 'Promotion', 'KPI': ['Reach']},
		{'code': 'DF', 'sequence': 5, 'name': 'Differentiation', 'KPI': ['Reach']},
		{'code': 'RT', 'sequence': 6, 'name': 'Retention', 'KPI': ['ROI']},
		{'code': 'EG', 'sequence': 7, 'name': 'Engagement', 'KPI': ['Reach']},
		{'code': 'RN', 'sequence': 8, 'name': 'Renewal', 'KPI': ['Cost']},
		{'code': 'RA', 'sequence': 9, 'name': 'Reactivation', 'KPI': ['Cost']}
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
				}
			},
			'rows': [
				{'FY': 2019, 'CLASS1': 20, 'CALC': 'REVENUE', 'ACCOUNT': '1150', 'MARKETING_ACTIVITY': '__DV.Cure One Stew', 'SOURCETYPE': 'Sponsorship', 'VALUES': [4608.00, 4418.41, 4480.81, 4420.82, 4389.63, 4430.43, 4305.64, 4303.25, 4128.05, 4212.06, 4288.87, 4279.27]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1150', 'MARKETING_ACTIVITY': '__DV.Cure One Stew', 'SOURCETYPE': 'Merchandise Sponsorship', 'VALUES': [1080.00, 1041.10, 1066.99, 1064.09, 917.19, 1029.48, 990.58, 980.48, 1006.37, 967.47, 993.37, 990.46]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M GOL', 'SOURCETYPE': 'Merchandise Gift of Love', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13500, 13500]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M GOL', 'SOURCETYPE': 'Merchandise Donation', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1500, 1500]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19PP.M GOL', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 300]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19AC.M NRMA', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [0, 0, 0, 18900, 25200, 18900, 0, 0, 0, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1850', 'MARKETING_ACTIVITY': '19AC.M NRMA', 'SOURCETYPE': 'Merchandise Postage', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19AC.M NRMA', 'SOURCETYPE': 'Merchandise Gift of Love', 'VALUES': [0, 0, 0, 8400, 11200, 8400, 0, 0, 0, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19AC.M NRMA', 'SOURCETYPE': 'Merchandise Donation', 'VALUES': [0, 0, 0, 2100, 2800, 2100, 0, 0, 0, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1150', 'MARKETING_ACTIVITY': '19AC.M NRMA', 'SOURCETYPE': 'Merchandise Sponsorship', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19AC.M NRMA', 'VALUES': [0, 0, 0, 420, 560, 420, 0, 0, 0, 0, 0, 0]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19PP.M WinterSpring', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [56138.54, 24493.39, 16624.94, 9446.00, 3054.94, 927.78, 67.59, 99.41, 21.21, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1850', 'MARKETING_ACTIVITY': '19PP.M WinterSpring', 'SOURCETYPE': 'Merchandise Postage', 'VALUES': [6315.59, 2755.51, 1870.31, 1062.68, 343.68, 104.37, 7.60, 11.18, 2.39, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M WinterSpring', 'SOURCETYPE': 'Merchandise Gift of Love', 'VALUES': [27066.80, 11809.31, 8015.60, 4554.32, 1472.92, 447.32, 32.59, 47.93, 10.23, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M WinterSpring', 'SOURCETYPE': 'Merchandise Donation', 'VALUES': [12380.55, 5401.67, 3666.39, 2083.18, 673.72, 204.61, 14.91, 21.92, 4.68, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1150', 'MARKETING_ACTIVITY': '19PP.M WinterSpring', 'SOURCETYPE': 'Merchandise Sponsorship', 'VALUES': [900.00, 934.92, 968.79, 965.65, 530.60, 527.64, 92.77, 89.99, 87.29, 84.67, 82.13, 79.67]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19PP.M WinterSpring', 'VALUES': [1002, 437, 297, 169, 55, 17, 1, 2, 0, 0, 0, 0]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19PP.M Christmas', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [0, 0, 100.69, 62206.64, 54790.71, 29728.72, 1733.87, 285.04, 194.32, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1850', 'MARKETING_ACTIVITY': '19PP.M Christmas', 'SOURCETYPE': 'Merchandise Postage', 'VALUES': [0, 0, 13.79, 8519.61, 7503.95, 4071.54, 237.47, 39.04, 26.61, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M Christmas', 'SOURCETYPE': 'Merchandise Gift of Love', 'VALUES': [0, 0, 80.99, 50035.78, 44070.79, 23912.23, 1394.64, 229.27, 156.30, 0, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M Christmas', 'SOURCETYPE': 'Merchandise Donation', 'VALUES': [0, 0, 43.78, 27082.37, 23892.97, 13030.32, 855.51, 222.53, 180.13, 92.77, 89.99, 87.29]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1150', 'MARKETING_ACTIVITY': '19PP.M Christmas', 'SOURCETYPE': 'Merchandise Sponsorship', 'VALUES': [108, 108, 108, 1404, 1836, 972, 108, 108, 108, 108, 108, 108]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19PP.M Christmas', 'VALUES': [0, 0, 2, 1352, 1191, 646, 38, 6, 4, 0, 0, 0]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19PP.M SummerAutumn', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [0, 0, 0, 0, 0, 0, 20160.00, 24192.00, 9216.00, 1728.00, 1152.00, 1152.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1850', 'MARKETING_ACTIVITY': '19PP.M SummerAutumn', 'SOURCETYPE': 'Merchandise Postage', 'VALUES': [0, 0, 0, 0, 0, 0, 2520.00, 3024.00, 1152.00, 216.00, 144.00, 144.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M SummerAutumn', 'SOURCETYPE': 'Merchandise Gift of Love', 'VALUES': [0, 0, 0, 0, 0, 0, 8400.00, 10080.00, 3840.00, 720.00, 480.00, 480.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M SummerAutumn', 'SOURCETYPE': 'Merchandise Donation', 'VALUES': [0, 0, 0, 0, 0, 0, 5460.00, 6552.00, 2496.00, 468.00, 312.00, 312.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1150', 'MARKETING_ACTIVITY': '19PP.M SummerAutumn', 'SOURCETYPE': 'Merchandise Sponsorship', 'VALUES': [0, 0, 0, 0, 0, 0, 432.00, 468.00, 466.92, 33.87, 32.86, 31.87]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19PP.M SummerAutumn', 'VALUES': [0, 0, 0, 0, 0, 0, 420, 504, 192, 36, 24, 24]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19PP.M Easter', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 20592.00, 13728.00, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1850', 'MARKETING_ACTIVITY': '19PP.M Easter', 'SOURCETYPE': 'Merchandise Postage', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 2948.40, 1965.60, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M Easter', 'SOURCETYPE': 'Merchandise Gift of Love', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 12636.00, 8424.00, 0, 0]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M Easter', 'SOURCETYPE': 'Merchandise Donation', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 4212.00, 2808.00, 432.00, 432.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1150', 'MARKETING_ACTIVITY': '19PP.M Easter', 'SOURCETYPE': 'Merchandise Sponsorship', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 432.00, 432.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19PP.M Easter', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 468, 312, 0, 0]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19PP.M EOFY', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4800.00, 7200.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1850', 'MARKETING_ACTIVITY': '19PP.M EOFY', 'SOURCETYPE': 'Merchandise Postage', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 756.00, 1134.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19PP.M EOFY', 'SOURCETYPE': 'Merchandise Gift of Love', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1200.00, 1800.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19PP.M EOFY', 'VALUES': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 120, 180]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '____.M Auxillary', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [450.00, 1350.00, 1350.00, 4950.00, 2700.00, 3600.00, 900.00, 2700.00, 1350.00, 2250.00, 900.00, 2250.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '____.M Auxillary', 'VALUES': [1, 3, 3, 11, 6, 8, 2, 6, 3, 5, 2, 5]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19AC.M Social Media', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [50.00, 50.00, 50.00, 50.00, 50.00, 50.00, 50.00, 50.00, 50.00, 50.00, 50.00, 50.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1850', 'MARKETING_ACTIVITY': '19AC.M Social Media', 'SOURCETYPE': 'Merchandise Postage', 'VALUES': [7.20, 7.20, 7.20, 7.20, 7.20, 7.20, 7.20, 7.20, 7.20, 7.20, 7.20, 7.20]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '1015', 'MARKETING_ACTIVITY': '19AC.M Social Media', 'SOURCETYPE': 'Merchandise Donation', 'VALUES': [2.00, 2.00, 2.00, 2.00, 2.00, 2.00, 2.00, 2.00, 2.00, 2.00, 2.00, 2.00]},
				{'FY': 2019, 'CLASS1': 15, 'CALC': 'TRANSACTION', 'MARKETING_ACTIVITY': '19AC.M Social Media', 'VALUES': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]},

				{'FY': 2019, 'CLASS1': 15, 'CALC': 'REVENUE', 'ACCOUNT': '200', 'MARKETING_ACTIVITY': '19EG.M FairTradeStalls', 'SOURCETYPE': 'Merchandise Purchase', 'VALUES': [0, 0, 2500.00, 0, 1800.00, 3000.00, 0, 0, 0, 1000.00, 0, 0]},
			]

		}
		# Fake Budget Data By Random Numbers
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
