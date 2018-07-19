from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('privenue', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.homepage', ['/'], endpoint='index')
ld.url('view_funcs.pending', ['/pending'])
ld.url('view_funcs.sourcecode1', ['/sourcecode1'])