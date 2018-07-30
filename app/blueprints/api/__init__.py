from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('api', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('data_user.get_current_user', ['/'], endpoint='index')

ld.url('data_mail.today', ['/mailbox/today', '/mailbox/today/<int:year_offset>'])
ld.url('data_mail.date', ['/mailbox/ymd', '/mailbox/ymd/<string:str_date>'])
ld.url('data_mail.year_month', ['/mailbox/ym/<string:str_yearmonth>'])

ld.url('data_privenue.fy_total_all', ['/cash/fys'])
ld.url('data_privenue.fy_total_all_ltd', ['/cash/fysltd'])
ld.url('data_privenue.cfy_platform_type_revenue', ['/cash/cfy/stream'])

# Merchandise related APIs
ld.url('data_merch.new_fy', ['/merch/new/fy/<string:fy>'])
ld.url('data_merch.new_cfy_month', ['/merch/new/cfy/<int:month>'])
ld.url('data_merch.rex_rfm', ['/merch/rfm/<filename>'])


ld.url('starshipit.search_orders', ['/ssi/orders/search', '/ssi/orders/search/<string:phrase>'])
ld.url('starshipit.get_order', ['/ssi/order/<int:order_id>'])
ld.url('starshipit.track_details', ['/ssi/track', '/ssi/track/<string:tracking_number>'])
ld.url('starshipit.get_unshipped_orders', ['/ssi/orders/unshipped', '/ssi/orders/unshipped/<string:since_order_date>'])
ld.url('starshipit.get_users_address_book', ['/ssi/addressbook'])
