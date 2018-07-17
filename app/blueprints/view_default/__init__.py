from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('default', __name__, prefixed=False)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.index', ['/'])
ld.url('view_funcs.test', ['/test'])
ld.url('view_funcs.logged', ['/logged'])
ld.url('view_funcs.login', ['/login'], methods=['POST'])
ld.url('view_funcs.login_as_guest', ['/login_as_guest'])
ld.url('view_funcs.logout', ['/logout'])


# App context
@bp.app_context_processor
def inject_now():
	from datetime import datetime
	return dict(now=datetime.now())


# App context
@bp.app_context_processor
def inject_cfy():
	from app.database.tlma import TLMA
	return dict(cfy=TLMA.cfy)


@bp.app_context_processor
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
