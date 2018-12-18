def inject_now():
	from datetime import datetime
	return dict(now=datetime.now())


def inject_cfy():
	from app.database.tlma import TLMA
	return dict(cfy=TLMA.cfy)


def inject_thankq_data_source():
	from app.database.odbc import ThankqODBC
	return dict(tq_use_live=ThankqODBC.use_live)


def inject_fy_month_list():
	from app.database.tlma import TLMA
	return dict(fymths=TLMA.get_fy_month_list())


def utility_processor():
	def get_package_json_version(lib_name, dependency='dependencies'):
		import json
		import os
		from flask import current_app
		# Read package.json
		base_dir = current_app.root_path.rsplit(os.sep, 1)[0]
		package_json_path = os.path.join(base_dir, 'package.json')

		with open(package_json_path) as f:
			package_json = json.load(f)
			package_json_version = ''
			for char in package_json[dependency][lib_name]:
				if char.isdigit() or char == '.':
					package_json_version += char
		return package_json_version
	return dict(versionNPM=get_package_json_version)
