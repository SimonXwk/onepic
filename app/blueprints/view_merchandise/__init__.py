from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('merch', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.merchandise_revenue_overview', ['/financial_year_revenue'])
ld.url('view_funcs.track_shipped_order', ['/track_order', '/track_order/<string:order_number>'])
ld.url('view_funcs.list_unshipped_orders', ['/unshipped_orders'])
ld.url('view_funcs.rfm_result', ['/rfm/result/<filename>'], endpoint='rfm_result')
ld.url('view_funcs.upload', ['/rfm/upload'], methods=['GET', 'POST'])
ld.url('view_funcs.merchandise_new_courtesy_call', ['/new_customer_courtesy_call'])
ld.url('view_funcs.merchandise_new_welcome_pack', ['/new_customer_welcome_pack'])

