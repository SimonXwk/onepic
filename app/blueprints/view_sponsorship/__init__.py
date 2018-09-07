from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('sponsorship', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.overview', ['/overview'])
ld.url('view_funcs.pledges', ['/pledges', '/pledges/<int:fy>'])
ld.url('view_funcs.pledge_income_fy', ['/pledge_income_cfy', '/pledge_income/fy/<int:fy>'])
ld.url('view_funcs.delinquency', ['/delinquency'])
