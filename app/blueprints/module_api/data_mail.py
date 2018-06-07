from flask import current_app, jsonify
from functools import wraps
import datetime
import glob
import os
import pandas as pd
from app.database.excel import read_excel_data
from app.blueprints.helpers import jsonified


def serialize_mail_data():
	def decorator(f):
		@wraps(f)
		def decorated_function(*args, **kwargs):
			# Run the wrapped function, which should return (())/[[]]/generator
			rng = f(*args, **kwargs)
			day_data = {
				'date': [],
				'opener': [],
				'cash': {
					'value': [],
					'fullyProcessed': []
				},
				'donation': {
					'count': {
						'CashCheque': [],
						'CreditCard': []
					},
					'value': {
						'CashCheque': [],
						'CreditCard': []
					}
				},
				'merchandise': {
					'count': {
						'CashCheque': [],
						'CreditCard': []
					},
					'value': {
						'CashCheque': [],
						'CreditCard': []
					}
				},
				'list': {
					'count': {
						'CashCheque': []
					},
					'value': {
						'CashCheque': []
					}
				},
				'other': {
					'count': {
						'CashCheque': []
					},
					'value': {
						'CashCheque': []
					}
				}
			}
			for row in rng:
				r = tuple(row)
				day_data['date'].append(datetime.datetime.strptime(str(r[0]), '%Y-%m-%d %H:%M:%S'))
				day_data['opener'].append(r[3])
				day_data['cash']['value'].append(int(r[16]) if r[16] else 0)
				day_data['cash']['fullyProcessed'].append(int(r[16]) == int(r[17]) if r[16] and r[17] else True if not r[16] else False)
				day_data['donation']['count']['CashCheque'].append(int(r[4]))
				day_data['donation']['count']['CreditCard'].append(int(r[5]))
				day_data['donation']['value']['CashCheque'].append(float(r[10]))
				day_data['donation']['value']['CreditCard'].append(float(r[11]))
				day_data['merchandise']['count']['CashCheque'].append(int(r[6]))
				day_data['merchandise']['count']['CreditCard'].append(int(r[7]))
				day_data['merchandise']['value']['CashCheque'].append(float(r[12]))
				day_data['merchandise']['value']['CreditCard'].append(float(r[13]))
				day_data['list']['count']['CashCheque'].append(int(r[8]))
				day_data['list']['value']['CashCheque'].append(float(r[14]))
				day_data['other']['count']['CashCheque'].append(int(r[9]))
				day_data['other']['value']['CashCheque'].append(float(r[15]))
			return day_data
		return decorated_function
	return decorator


class MailExcel:
	# Read Base Path from flask config
	base_folder = current_app.config.get('CSD_MAIL_PATH')
	# Locate Data
	export_folder = os.path.join(base_folder, 'Export')
	excel_folder = os.path.join(base_folder, 'Mail Opening')
	excel_pattern = os.path.join(excel_folder, '{}', '{}')

	# Summary Sheet Info
	summary_sheet = {
		'name': current_app.config.get('CSD_MAIL_DATA_TAB'),
		'range': current_app.config.get('CSD_MAIL_DATA_RANGE'),
		'header': ('Date', 'No', 'Total', 'Recorder', 'NoDCaCh', 'NoDCC', 'NoMCaCh', 'NoMCC', 'NoList', 'NoOther', 'TotalDCaCh', 'TotalDCC', 'TotalMCaCh', 'TotalMCC', 'TotalList', 'TotalOther', 'Cash', 'CashPending')
	}

	@classmethod
	def get_folder_tree(cls):
		immed_child = next(os.walk(cls.excel_folder))[1]
		folders_dict = {fd: [f for f in os.listdir(os.path.join(cls.excel_folder, fd)) if os.path.isfile(os.path.join(cls.excel_folder, fd, f))] for fd in immed_child}
		return folders_dict

	@classmethod
	def locate_excel(cls, years=None, months=None):
		""" Collect a list of file names using given years and months to match agains the file names
		:param years: a list/single value of year number in 4 digits (with leading zeros)
		:param months: a list/single value of month number in 2 digits (with leading zeros)
		:return: a List of file names that matches the years and months given using many - many combination (permutation)
		"""
		# todo: add list support for name searching
		# if both years and months are None
		year_pattern = '**'
		month_pattern = '*.xl*'

		if years is not None:
			if isinstance(years, int) or isinstance(years, float):
				year_pattern = '{:04d}'.format(int(years))
			else:
				for year in years:
					year_pattern += str(year)

		if months is not None:
			if isinstance(months, int) or isinstance(months, float):
				month_pattern = '*{:02d}*.xl*'.format(int(months))
			else:
				for mth in months:
					month_pattern += str(mth)

		pattern = cls.excel_pattern.format(year_pattern, month_pattern)
		return [f for f in glob.glob(pattern, recursive=False) if not os.path.basename(f).startswith('~')]


# @to_data_frame(MailExcel.summary_sheet['header'])
@serialize_mail_data()
def read_mail_data(file, sheet_name='Sheet1', range_address='A1:A1'):
	""" Read a single Excel data range in given sheet by name
	:param file: a single file name
	:param sheet_name: the name of the sheet that contains the data
	:param range_address: the range address in the sheet, not in R1C1 but normal (eg A1:B2)
	:return: a generator of the excel data range representation
	"""
	rows = None
	if file:
		rng = read_excel_data(file, sheet_name, range_address)
		if rng:
			rows = ((cell.value for cell in row) for row in rng if isinstance(row[0].value, datetime.datetime))
	return rows


@jsonified
def date(str_date=None):
	data = {}
	dt = datetime.date.today()
	if str_date:
		try:
			dt = datetime.datetime.strptime(str(str_date), '%Y%m%d')
		except ValueError:
			pass
	# If both year and month are provided, then function should return a list with only one element
	excels = MailExcel.locate_excel(dt.year, dt.month)
	excel_display = [' | '.join((e.rsplit(os.path.sep, 3)[-2], e.rsplit(os.path.sep, 3)[-1])) for e in excels]
	if excels:
		if len(excels) == 1:
			excel_display = excel_display[0]
			excel = excels[0]
			data = read_mail_data(excel, MailExcel.summary_sheet['name'], MailExcel.summary_sheet['range'])
		else:
			data = pd.concat([read_mail_data(excel, MailExcel.summary_sheet['name'], MailExcel.summary_sheet['range']) for excel in excels], axis=0, ignore_index=True)

	return dict(year=dt.year, month=dt.month, files=excel_display, data=data)


@jsonified
def year_month(str_yearmonth=None):
	excels = MailExcel.locate_excel(int(str_yearmonth[:4]), int(str_yearmonth[4:]))
	excel = None
	if excels:
		excel = excels[0]
	return dict(file=excel)


@jsonified
def today(year_offset=0):
	td = datetime.date.today()
	td = td.replace(year=td.year - year_offset, day=td.day if not(td.month == 2 and td.day == 29) else td.day-1)
	excels = MailExcel.locate_excel(td.year, td.month)
	data = []
	if excels:
		rng = read_excel_data(excels[0], MailExcel.summary_sheet['name'], MailExcel.summary_sheet['range'])
		if rng:
			for row in rng:
				if isinstance(row[0].value, datetime.datetime) \
					and datetime.datetime.strptime(str(row[0].value), '%Y-%m-%d %H:%M:%S').date() == td:
					data = {MailExcel.summary_sheet['header'][key]: cell.value for key, cell in enumerate(row)}
	return data


@jsonified
def home():
	return dict(app='onepic', author='Simon Xue')




