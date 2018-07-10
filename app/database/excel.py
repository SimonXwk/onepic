import openpyxl
import io


class ExcelWorkbook(object):
	def __init__(self, file):
		self.file_full_path = file

	def read_range(self, sheet_name='Sheet1', range_address='A1:A1'):
		rng = None
		if self.file_full_path:
			with open(self.file_full_path, 'rb') as f:
				in_mem_file = io.BytesIO(f.read())
				rng = openpyxl.load_workbook(in_mem_file, read_only=True, data_only=True)[sheet_name][range_address]
		return rng
