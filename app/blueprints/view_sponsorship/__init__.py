from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('sponsorship', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.pledges', ['/pledges', '/pledges/<int:fy>'])
