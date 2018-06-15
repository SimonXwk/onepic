from app.helpers import create_blueprint, LazyLoader

bp = create_blueprint('mailbox', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.today', ['/today', '/daily'], endpoint='index')
ld.url('view_funcs.daily', ['/today', '/daily'])
ld.url('view_funcs.monthly', ['/monthly'])
ld.url('view_funcs.excel_list', ['/excels'])
ld.url('view_funcs.excel_download', ['/excels/download/<string:filename>'])






