from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('privenue', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.overview', ['/'], endpoint='index')
ld.url('view_funcs.campaign_activity', ['/campaign_activity'])
ld.url('view_funcs.comparative', ['/comparative'])
ld.url('view_funcs.pending', ['/pending'])
ld.url('view_funcs.sourcecode1_created', ['/sourcecode1_created'])
ld.url('view_funcs.sourcecode1_active', ['/sourcecode1_active'])
ld.url('view_funcs.revenue_streams', ['/revenue_streams'])
ld.url('view_funcs.single_campaign', ['/single_campaign'])

