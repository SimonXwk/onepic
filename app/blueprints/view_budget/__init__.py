from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('budget', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.scoping_fy20', ['/scoping_fy20'])
ld.url('view_funcs.chart_of_account', ['/chart_of_account'])
ld.url('view_funcs.classes', ['/classes'])
