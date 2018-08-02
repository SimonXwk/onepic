from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('merchandise', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.homepage', ['/'], endpoint='index')
ld.url('view_funcs.track_order', ['/track_order'])
ld.url('view_funcs.rfm_result', ['/rfm/result/<filename>'], endpoint='rfm_result')
ld.url('view_funcs.upload', ['/rfm/upload'], methods=['GET', 'POST'])
