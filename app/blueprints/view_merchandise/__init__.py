from app.helpers import create_blueprint, LazyLoader

bp = create_blueprint('merchandise', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.homepage', ['/'], endpoint='index')
ld.url('view_funcs.show_rfm_single', ['/rfm/<filename>'])
ld.url('view_funcs.upload', ['/upload'], methods=['GET', 'POST'])
