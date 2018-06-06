import os
import glob
import datetime
import pandas as pd
from flask import current_app
from .rfm_segment import Segment2 as Segment


def get_data_folder():
	# csv_folder = "csv"
	folder = current_app.config['RFM_UPLOAD_FOLDER']
	if not os.path.exists(folder):
		os.makedirs(folder)
	return folder


def get_result_folder():
	folder = current_app.config['RFM_RESULT_FOLDER']
	if not os.path.exists(folder):
		os.makedirs(folder)
	return folder


def list_all_files():
	sep1 = current_app.config['RFM_SECTOR_SEP']
	sep2 = current_app.config['RFM_SCORE_SEP']
	# Mask structure: (REX)_(system report start date)_(system report end date)_(NOW)_now date you defined_(R highest score),(F highest score),(M highest score).csv
	# Date format in file name : '%Y%m%d'
	filename_pattern = sep1.join(['REX', '[0-9][0-9][0-9][0-9][0-1][0-9][0-3][0-9]', '[0-9][0-9][0-9][0-9][0-1][0-9][0-3][0-9]', '[1-9]' + sep2 + '[1-9]' + sep2 + '[1-9]'])
	# String(mask) the describes what the file name looks like
	mask = os.path.join(get_data_folder(), filename_pattern + '.csv')
	return glob.glob(mask)


def rfm_calculate_score(value, buckets, q_dict, sort_type='asc'):
	"""
	:param value: a value to be rendered into RFM score
	:param buckets: quantile definition, a list of unique elements that are in range [0,1] in ascending order
	:param q_dict: quantile calculation by using buckets above, a dictionary of keys of the percentages  in buckets above and values of calculated values percentiles
	:param sort_type:
	:return: calculated RFM score, 1 is the worst and len(buckets)+1 is the best (ASC), 1 is the best and len(buckets)+1 is worst (DESC)
	"""
	if str(sort_type).upper() == 'ASC':
		for key, bucket in enumerate(buckets):
			if value > q_dict[buckets[-1]]:
				return len(buckets) + 1  # Bigger than the highest percentile : highest score
			elif value <= q_dict[bucket]:
				return key + 1  # Checking from lowest to highest, give score on the first match
	elif str(sort_type).upper() == 'DESC':
		for key, bucket in enumerate(reversed(buckets)):
			if value < q_dict[buckets[-1]]:
				return len(buckets) + 1  # Smaller than the highest percentile : highest score
			elif value >= q_dict[bucket]:
				return key + 1  # Checking from highest to lowest, give score on the first match


def rfm_analysis(file_name=None):
	if file_name:
		file_list = [os.path.join(get_data_folder(), file_name)]
		print('Analysing File {}'.format(file_name))
	else:
		# Find out which csv files to be collected, returning a list of file names
		file_list = list_all_files()
		print('Number of files to be analysed: {}\n{}'.format(len(file_list), file_list))

	sep1 = current_app.config['RFM_SECTOR_SEP']
	sep2 = current_app.config['RFM_SCORE_SEP']
	data = {}  # A dictionary that will hold all database

	for f in file_list:
		# Collect the 'NOW' date for RFM analysis from the file name
		file_path_exc_extension, file_extension = os.path.splitext(f)
		folder, filename = file_path_exc_extension.rsplit(os.sep, 1)

		# Interpreting the special file naming structure
		file_dict = {
			'format': file_extension,
			'folder': folder,
			'filename': filename,
			'start': datetime.datetime.strptime(filename.split(sep1)[1], '%Y%m%d'),
			'end': datetime.datetime.strptime(filename.split(sep1)[2], '%Y%m%d'),
			'now': datetime.datetime.strptime(filename.split(sep1)[2], '%Y%m%d').date() + datetime.timedelta(days=1),
			'r_score_max': int(filename.split(sep1)[3].split(sep2)[0]),
			'f_score_max': int(filename.split(sep1)[3].split(sep2)[1]),
			'm_score_max': int(filename.split(sep1)[3].split(sep2)[2]),
		}

		# Keep the columns that are essential to RFM analysis
		raw_header_customer_id, raw_header_customer_date, raw_header_order_id, raw_header_net = \
			'CustomerNumber', 'Date Created', 'OrderNumber', 'Sale Price Ext'
		rfm_headers = [raw_header_customer_id, raw_header_customer_date, raw_header_order_id, raw_header_net]
		additional_header = ['Product Type', 'Description']

		# Collect information from each file and create Pandas DataFrame
		# If file contains no header row, then you should explicitly pass header=None
		raw = pd.read_csv(f, index_col=None, low_memory=False, usecols=rfm_headers + additional_header)

		# We want only the coffee buyers
		# raw['Coffee'] = raw['Description Type'] = 'Food & Beverages' and raw['Description Type'].str.contain('Food & Beverages', flags=re.IGNORECASE, regex=True)
		# print(raw)

		raw = raw.loc[:, rfm_headers]
		# print('\nRaw Data Format : {}\n{}'.format(raw.shape, raw.dtypes))

		# Cleaning and reformatting raw database
		# Series.astype would not convert things that can not be converted to while pandas.to_datetime(Series) can (NaN).
		raw[raw.select_dtypes(['object']).columns] = raw.select_dtypes(['object']).apply(lambda x: x.str.strip())  # Trimming String columns
		raw[raw_header_customer_date] = pd.to_datetime(raw[raw_header_customer_date], dayfirst=True)  # Convert to datetime value
		raw[raw_header_net] = pd.to_numeric(raw[raw_header_net]).astype('float').fillna(0)  # Convert to numeric value, format to float and fill na with zero
		# print('\nNew Data Format : {}\n{}'.format(raw.shape, raw.dtypes))

		# Creating RFM database set
		recency_max = (file_dict['now'] - raw[raw_header_customer_date].min()).days  # <class 'datetime.datetime'> - <class 'pandas._libs.tslib.Timestamp'> gives <class 'pandas._libs.tslib.Timedelta'>
		rfm = raw.groupby(raw_header_customer_id).agg(
			{
				raw_header_customer_date: lambda x:  (file_dict['now'] - x.max()).days,
				raw_header_order_id: 'nunique',
				raw_header_net: 'sum',
			}
		)
		rfm.rename(columns={raw_header_customer_date: 'recency', raw_header_order_id: 'frequency', raw_header_net: 'monetary_value'}, inplace=True)
		# print('\nRFM Data Descriptive Statistics :\nAssuming NOW refers to {}\n{}'.format(rfm_now, rfm.describe()))
		# rfm = rfm.loc[rfm['frequency'] < 120, :]

		rfm['last_trx'] = raw.groupby(raw_header_customer_id)[raw_header_customer_date].max()
		rfm['now'] = pd.to_datetime(file_dict['now'])
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
		print('\nquantiles R:\n{}\nquantiles F:\n{}\nquantiles M:\n{}'.format(quantile['r'], quantile['f'], quantile['m']))

		# Apply quantiles to RFM database set
		rfm['r_score'] = rfm['recency'].apply(rfm_calculate_score, args=(buckets_r, quantile['r'], 'desc'))
		rfm['f_score'] = rfm['frequency'].apply(rfm_calculate_score, args=(buckets_f, quantile['f'], 'asc'))
		rfm['m_score'] = rfm['monetary_value'].apply(rfm_calculate_score, args=(buckets_m, quantile['m'], 'asc'))

		# Input for Segment Calculation
		input_type1 = ['r_score', 'f_score', 'm_score']
		input_type2 = ['recency', 'frequency', 'monetary_value']
		rfm['Segment'] = rfm.loc[:, input_type2].apply(lambda x: Segment.calc(x), axis=1)

		# Save Result
		try:
			rfm.to_csv(os.path.join(get_result_folder(), '_'.join([filename, 'rfmTable']) + '.csv'), encoding='utf-8-sig')
		except PermissionError:
			print('Permission denied')

		# Preparing Output
		seg_dict = rfm['Segment'].value_counts().to_dict()
		seg_data = dict(file=file_dict, quantile=quantile, segment=Segment.segments, name=list(seg_dict.keys()), value=list(seg_dict.values()))

		if file_name:
			data = seg_data
		else:
			data[file_dict['filename']] = seg_data
	# print(rfm['Segment'])

	print('\nRFM calculation finished, check results in folder : {}'.format(os.path.join(os.getcwd(), get_data_folder())))
	return data
