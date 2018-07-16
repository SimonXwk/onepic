from app.helpers import create_blueprint, LazyLoader

bp = create_blueprint('stats', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.fishing_pool', ['/fishing_pool'])
