from flask import current_app, jsonify
import datetime
import glob
import os
import pandas as pd
from app.database.dataframe import to_data_frame
from app.database.excel import read_excel_data


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
		'header': ('Date', 'No', 'Total', 'Recorder', 'NoDCA', 'NoDCC', 'NoMCA', 'NoMCC', 'NoList', 'NoOther', 'ValDCA', 'ValDCC', 'ValMCA', 'ValMCC', 'ValList', 'ValOther', 'ValCash', 'ValCashPending')
	}

	@classmethod
	def get_folder_tree(cls):
		immed_child = next(os.walk(cls.excel_folder))[1]
		folders_dict = {fd : [f for f in os.listdir(os.path.join(cls.excel_folder, fd)) if os.path.isfile(os.path.join(cls.excel_folder, fd, f))] for fd in immed_child}
		return folders_dict

	@classmethod
	def locate(cls, years=None, months=None):
		""" Collect a list of file names using given years and months to match agains the file names
		:param years: a list/single value of year number in 4 digits (with leading zeros)
		:param months: a list/single value of month number in 2 digits (with leading zeros)
		:return: a List of file names that matches the years and months given using many - many combination (permutation)
		"""
		# if years and months are None
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


@to_data_frame(MailExcel.summary_sheet['header'])
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


def date(str_date=None):
	status = 'yes'
	dt = datetime.date.today()
	if str_date:
		try:
			dt = datetime.datetime.strptime(str(str_date), '%Y%m%d')
		except ValueError:
			status = 'no'

	excels = MailExcel.locate(dt.year, dt.month)
	excel_display = ['|'.join((e.rsplit(os.path.sep, 3)[-2], e.rsplit(os.path.sep, 3)[-1])) for e in excels]
	
	df = None
	if excels:
		if len(excels) == 1:
			excel_display = excel_display[0]
			df = read_mail_data(excels[0], MailExcel.summary_sheet['name'], MailExcel.summary_sheet['range'])
		else:
			df = pd.concat([read_mail_data(excel, MailExcel.summary_sheet['name'], MailExcel.summary_sheet['range']) for excel in excels], axis=0, ignore_index=True)

	print(df)

	return jsonify(dict(date=dt, date_valid=status, files=excel_display))


def year_month(str_yearmonth=None):
	print(str_yearmonth)
	excels = MailExcel.locate(int(str_yearmonth[:4]), int(str_yearmonth[4:]))
	excel = None
	if excels:
		excel = excels[0]
	return jsonify(dict(file=excel))


def home():
	return jsonify(dict(app='onepic', author='Simon Xue'))




