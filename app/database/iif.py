import os
from datetime import datetime
from flask import current_app

account_class_iif_folder = current_app.config.get('FINANCE_IIF_FOLDER')
account_file_path = os.path.join(account_class_iif_folder, 'COA.IIF')
class_file_path = os.path.join(account_class_iif_folder, 'CLASS.IIF')


def get_class_list_of_dicts():
	class_list = []
	with open(class_file_path) as f:
		# First Three Rows are IIF Header rows
		for line in f.readlines()[3:]:
			# Remove all " that were added due to character like ,
			arr = line.replace('\"', '').split('\t')
			if arr[0] == 'CLASS':
				levels = arr[1].split(':')
				class_list.append({
					'ID': arr[2],
					'NAME': arr[1],
					'TIMESTAMP': datetime.fromtimestamp(int(arr[3])),
					'ACTIVE': -1 if arr[4] == 'N' else 0,
					'LEVEL': len(levels),
					'LEVEL1NUM': arr[1][:2],
					'LEVELS': levels
				})
	try:
		lmtime = os.path.getmtime(class_file_path)
	except OSError:
		lmtime = 0
	last_modified_date = datetime.fromtimestamp(lmtime)
	return {'last_modified': last_modified_date, 'rows': class_list}


def get_account_list_of_dicts():
	account_list = []
	with open(account_file_path) as f:
		# First Three Rows are IIF Header rows
		for line in f.readlines()[3:]:
			# Remove all " that were added due to character like ,
			arr = line.replace('\"', '').split('\t')
			if arr[0] == 'ACCNT':
				levels = arr[1].split(':')
				account_list.append({
					'ID': arr[2],
					'NAME': arr[1],
					'TIMESTAMP': datetime.fromtimestamp(int(arr[3])),
					'ACCOUNTTYPE': arr[4],
					'DESCRIPTION': arr[6],
					'ACCOUNTNUMEBR': arr[7],
					'ACTIVE': -1 if arr[14] == 'N' else 0,
					'TAXCODE': arr[8],
					'BANKNUMBER': arr[10],
					'LEVEL': len(levels),
					'LEVELS': levels
				})
	try:
		lmtime = os.path.getmtime(account_file_path)
	except OSError:
		lmtime = 0
	last_modified_date = datetime.fromtimestamp(lmtime)
	return {'last_modified': last_modified_date, 'rows': account_list}
