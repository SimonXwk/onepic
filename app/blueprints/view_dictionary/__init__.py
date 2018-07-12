from app.helpers import create_blueprint, LazyLoader

bp = create_blueprint('dictionary', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.homepage', ['/'], endpoint='index')
ld.url('view_funcs.marketing_cycle', ['/marketing_cycle'],)
ld.url('view_funcs.donor_type', ['/donor_type'],)
