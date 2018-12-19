from flask import current_app
import os
import glob
import datetime
from app.database.excel import Workbook
import pandas as pd
from app.cache import cached
from app.helper import request_arg, jsonified
import app.tests as tests


def get_data_folder():
	return current_app.config['MERCHANDISE_PICKINGSLIP_FOLDER']


def get_matched_files(name_pattern='*.xlsx'):
	mask = os.path.join(get_data_folder(), name_pattern)
	# Files start wil ~ must be excluded when dealing with excel files
	return [f for f in glob.glob(mask, recursive=False) if not os.path.basename(f).startswith('~')]


@cached(10)
def list_all_files():
	result = {}
	files = get_matched_files()

	if files:
		for file in files:
			file_obj = dict(workbook=file.rsplit(os.sep, 1)[1])

			wb = Workbook(file)
			if wb is not None:
				file_obj['sheets'] = len(wb.worksheets)
				file_obj['created'] = wb.created
				file_obj['creator'] = wb.creator
				# Take the last sheet as default data sheet
				ws = wb.get_sheet_by_name(wb.sheet_names[-1])

				for ws_name in wb.sheet_names:
					if 'FULFILLMENTREPORT' in ws_name.upper():
						# If the tab's name contains 'Fulfillmentreport', treat the last sheet meet this condition as data sheet
						ws = wb.get_sheet_by_name(ws_name)
						file_obj.setdefault('dataSheet', {}).update(dict(title=ws.title, state=ws.sheet_state, minRow=ws.min_row, maxRow=ws.max_row, minColumn=ws.min_column, maxColumn=ws.max_column))
			result.setdefault('rows', []).append(file_obj)
			result['timestamp'] = datetime.datetime.now()
	return result


@cached(20)
def read_one_slip(filename, tab):
	result = {}
	files = get_matched_files(str(filename))
	if files:
		f = files[0]
		wb = Workbook(f)
		if wb is not None:
			if tab is None:
				tab = wb.sheet_names[0]
			ws = wb.get_sheet_by_name(tab)
			rng = wb.get_range_by_square(tab, ws.min_row,  ws.min_column, ws.max_row, ws.max_column)
			rows = [[cell.value for cell in r] for r in rng]
			result['headers'] = rows[0]
			result['rows'] = [dict(zip(rows[0], r)) for r in rows[1:]]
			result.update(dict(headers=rows[0], workbook=filename, creator=wb.creator, created=wb.created, tab=tab, timestamp=datetime.datetime.now(), minRow=ws.min_row, maxRow=ws.max_row, minColumn=ws.min_column, maxColumn=ws.max_column))
	return result

