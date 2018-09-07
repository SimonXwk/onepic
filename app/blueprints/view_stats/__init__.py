from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('stats', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.fishing_pool', ['/fishing_pool'])
ld.url('view_funcs.segments', ['/segments'])
ld.url('view_funcs.donor_types', ['/donor_types'])

