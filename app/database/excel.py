import openpyxl
import io


def read_excel_data(file, sheet_name='Sheet1', range_address='A1:A1'):
	rng = None
	if file:
		with open(file, 'rb') as f:
			in_mem_file = io.BytesIO(f.read())
			rng = openpyxl.load_workbook(in_mem_file, read_only=True, data_only=True)[sheet_name][range_address]
	return rng
