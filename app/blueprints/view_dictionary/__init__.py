from app.helpers import create_blueprint, LazyLoader

bp = create_blueprint('dictionary', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.homepage', ['/'], endpoint='index')
