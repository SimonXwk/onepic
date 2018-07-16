import os
import glob
import datetime
import pandas as pd
from flask import current_app
from .rfm_segment import Segment1 as Segment
from app.cache import cached


def get_data_folder():
	folder = current_app.config['RFM_UPLOAD_FOLDER']
	if not os.path.exists(folder):
		os.makedirs(folder)
	return folder


def get_result_folder():
	folder = current_app.config['RFM_RESULT_FOLDER']
	if not os.path.exists(folder):
		os.makedirs(folder)
	return folder


@cached(10)
def list_all_files():
	sep1 = current_app.config['RFM_SECTOR_SEP']
	sep2 = current_app.config['RFM_SCORE_SEP']
	# Mask structure: (REX)_(system report start date)_(system report end date)_(NOW)_now date you defined_(R highest score),(F highest score),(M highest score).csv
	# Date format in file name : '%Y%m%d'
	filename_pattern = sep1.join(['REX', '[0-9][0-9][0-9][0-9][0-1][0-9][0-3][0-9]', '[0-9][0-9][0-9][0-9][0-1][0-9][0-3][0-9]', '[1-9]' + sep2 + '[1-9]' + sep2 + '[1-9]'])
	# String(mask) the describes what the file name looks like
	mask = os.path.join(get_data_folder(), filename_pattern + '.csv')
	return glob.glob(mask)


def calculate_rfmscore(value, q_dict, one_is_worst=True):
	"""
	:param value: a value to be rendered into RFM score
	:param q_dict: quantile calculation by using bucket like[0.25,0.50,0.75] , a dictionary of keys are the percentages and values are calculated percentiles
	:param one_is_worst: When True, the smallest value will have lowest RFM score, vise versa.
	:return: calculated RFM score, 1 is the worst and len(buckets)+1 is the best (ASC), 1 is the best and len(buckets)+1 is worst (DESC)
	"""
	max_score = len(q_dict) + 1  # Max score 5 needs 4 break points(percentiles)
	sorted_bucket = sorted(list(q_dict.keys()))  # Sort the percentage by ascending, first percentage wil be the smallest
	for idx, percentage in enumerate(sorted_bucket):
		if value <= q_dict[percentage]:
			return idx + 1 if one_is_worst else max_score - idx  # Bigger than or equal to the current percentile
	return max_score if one_is_worst else 1  # Could not math in the for loop, then it will be the smallest/biggest score


class RFM(object):
	def __init__(self, file_name=None):
		self.csv_file = file_name
		self.file_full_path = os.path.join(get_data_folder(), self.csv_file)
		self.file_dict = self.read_file_name(file_name)

	@cached(15)
	def read_file_name(self, file_name):
		file_dict = {}
		if self.csv_file:
			print('> Analysing File {}'.format(file_name))
			# Analysing CSV File Name
			sep1 = current_app.config['RFM_SECTOR_SEP']
			sep2 = current_app.config['RFM_SCORE_SEP']

			file_path_exc_extension, file_extension = os.path.splitext(self.file_full_path)
			folder, filename = file_path_exc_extension.rsplit(os.sep, 1)

			# Interpreting the special file naming structure
			file_dict = {
				'folder': folder,
				'filename': filename,
				'format': file_extension,
				'start': datetime.datetime.strptime(filename.split(sep1)[1], '%Y%m%d'),
				'end': datetime.datetime.strptime(filename.split(sep1)[2], '%Y%m%d'),
				'now': datetime.datetime.strptime(filename.split(sep1)[2], '%Y%m%d').date() + datetime.timedelta(days=1),
				'r_score_max': int(filename.split(sep1)[3].split(sep2)[0]),
				'f_score_max': int(filename.split(sep1)[3].split(sep2)[1]),
				'm_score_max': int(filename.split(sep1)[3].split(sep2)[2]),
			}
		return file_dict

	@cached(20)
	def analysis(self):
		file_name = self.csv_file
		data = {}  # A dictionary that will hold all database
		if file_name:
			file_dict = self.file_dict

			# Keep the columns that are essential to RFM analysis
			raw_header_customer_id, raw_header_order_date, raw_header_order_id, raw_header_net = \
				'CustomerNumber', 'Date Created', 'OrderNumber', 'Sale Price Ext'
			rfm_headers = [raw_header_customer_id, raw_header_order_date, raw_header_order_id, raw_header_net]
			additional_header = ['Product Type', 'Description', 'Quantity', 'Bill Name', 'Order Status']

			# Collect information from csv by creating Pandas DataFrame
			# If file contains no header row, then you should explicitly pass header=None
			raw = pd.read_csv(self.file_full_path, index_col=None, low_memory=False, usecols=rfm_headers + additional_header)
			excluded_rows = raw[raw['Order Status'] != 'Processed'].shape[0]

			# Only use processed order data with 3 R F M columns to keep the DataFrame small
			raw = raw.loc[raw['Order Status'] == 'Processed', rfm_headers]
			# print('\nRaw Data Format : {}\n{}'.format(raw.shape, raw.dtypes))

			# Cleaning and reformatting raw database
			# Series.astype would not convert things that can not be converted to while pandas.to_datetime(Series) can (NaN).
			raw[raw.select_dtypes(['object']).columns] = raw.select_dtypes(['object']).apply(lambda x: x.str.strip())  # Trimming String columns
			raw[raw_header_order_date] = pd.to_datetime(raw[raw_header_order_date], dayfirst=True)  # Convert to datetime value
			raw[raw_header_net] = pd.to_numeric(raw[raw_header_net]).astype('float').fillna(0)  # Convert to numeric value, format to float and fill na with zero
			# print('\nNew Data Format : {}\n{}'.format(raw.shape, raw.dtypes))

			# Creating RFM database set
			# recency_max = (file_dict['now'] - raw[raw_header_order_date].min()).days  # <class 'datetime.datetime'> - <class 'pandas._libs.tslib.Timestamp'> gives <class 'pandas._libs.tslib.Timedelta'>
			cutting_date = file_dict['end'] + datetime.timedelta(days=1)
			rfm = raw.groupby(raw_header_customer_id).agg(
				{
					raw_header_order_date: lambda x: round((cutting_date - x.max()).total_seconds() / datetime.timedelta(days=1).total_seconds(), 2),
					raw_header_order_id: 'nunique',
					raw_header_net: 'sum',
				}
			)
			rfm.rename(columns={raw_header_order_date: 'recency', raw_header_order_id: 'frequency', raw_header_net: 'monetary_value'}, inplace=True)
			# print('\nRFM Data Descriptive Statistics :\nAssuming NOW refers to {}\n{}'.format(cutting_date, rfm.describe()))

			# rfm['last_trx'] = raw.groupby(raw_header_customer_id)[raw_header_order_date].max()
			# rfm['now'] = pd.to_datetime(cutting_date)
			# print('\nRFM Data Format : {}\n{}'.format(rfm.shape, rfm.dtypes))

			# Calculate quantile
			buckets_r = [float(x / file_dict['r_score_max']) for x in range(1, file_dict['r_score_max'])]
			buckets_f = [float(x / file_dict['f_score_max']) for x in range(1, file_dict['f_score_max'])]
			buckets_m = [float(x / file_dict['m_score_max']) for x in range(1, file_dict['m_score_max'])]

			quantile = {
				'r': rfm['recency'].quantile(q=buckets_r).to_dict(),
				'f': rfm['frequency'].quantile(q=buckets_f).to_dict(),
				'm': rfm['monetary_value'].quantile(q=buckets_m).to_dict()
			}
			# print('\nQuantiles :\n{}'.format(quantile))

			# Apply quantiles to RFM database set
			rfm['r_score'] = rfm['recency'].apply(calculate_rfmscore, q_dict=quantile['r'], one_is_worst=False)
			rfm['f_score'] = rfm['frequency'].apply(calculate_rfmscore, q_dict=quantile['f'])
			rfm['m_score'] = rfm['monetary_value'].apply(calculate_rfmscore, q_dict=quantile['m'])

			# Candidate Columns for RFM Segment Calculation: 'r_score', 'f_score', 'm_score', 'recency', 'frequency', 'monetary_value'
			rfm['Segment'] = rfm.loc[:, ['recency', 'frequency', 'monetary_value']].apply(lambda x: Segment.calc(x), axis=1)

			# print(rfm.head().reset_index().T.to_dict())
			rfm['rfm_score'] = (rfm['r_score'].astype(str)) + (rfm['f_score'].astype(str)) + (rfm['m_score'].astype(str))

			# # Save Result
			try:
				rfm.to_csv(os.path.join(get_result_folder(), '_'.join([file_dict['filename'], 'rfmTable']) + '.csv'), encoding='utf-8-sig')
				print('Success : RFM result saved as CSV')
			except PermissionError:
				print('Permission denied : Attempt to save as CSV')

			# Preparing Output
			seg_dict = rfm['Segment'].value_counts().to_dict()
			rfm_dict = rfm['rfm_score'].value_counts().to_dict()

			data = dict(file=file_dict, quantile=quantile, segments=dict(definition=Segment.segments, actuals=seg_dict),
				rfm=dict(excluded_records=excluded_rows, scores=rfm_dict, rows=rfm.reset_index().T.to_dict()))
			# print('\nRFM calculation finished, check results in folder : {}'.format(os.path.join(os.getcwd(), get_data_folder())))
		return data
