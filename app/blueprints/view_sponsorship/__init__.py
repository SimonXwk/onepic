from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('pledge', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.lifecycle', ['/lifecycle'])
ld.url('view_funcs.overview', ['/overview'])
ld.url('view_funcs.fy_monthly', ['/monthly'])
ld.url('view_funcs.pledges', ['/pledges', '/pledges/<int:fy>'])
ld.url('view_funcs.pledge_income_fy', ['/pledge_income_cfy', '/pledge_income/fy/<int:fy>'])
ld.url('view_funcs.delinquency', ['/delinquency'])
