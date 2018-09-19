from flask import current_app
import os
import glob
import datetime
from app.database.excel import ExcelWorkbook
import pandas as pd
from app.cache import cached


def get_data_folder():
	return current_app.config['MERCHANDISE_PICKINGSLIP_FOLDER']


@cached(10)
def list_all_files():
	result = {}

	mask = os.path.join(get_data_folder(), '*' + '.xlsx')
	# Files start wil ~ must be excluded when dealing with excel files
	files = [f for f in glob.glob(mask, recursive=False) if not os.path.basename(f).startswith('~')]

	if files:
		for file in files:
			file_obj = dict(filePath=file)

			wb = ExcelWorkbook(file)
			if wb is not None:
				# Take the last sheet as default data sheet
				ws = wb.get_sheet_by_name(wb.sheet_names[-1])

				for ws_name in wb.sheet_names:
					file_obj.setdefault('sheets', []).append(ws_name)
					if 'FULFILLMENTREPORT' in ws_name.upper():
						# If the tab's name contains 'Fulfillmentreport', treat the last sheet meet this condition as data sheet
						ws = wb.get_sheet_by_name(ws_name)
						file_obj.setdefault('dataSheet', {}).update(dict(title=ws.title, state=ws.sheet_state, minRow=ws.min_row, maxRow=ws.max_row, minColumn=ws.min_column, maxColumn=ws.max_column))
			result.setdefault('rows', []).append(file_obj)
			result['timestamp'] =  datetime.datetime.now()

	return result
