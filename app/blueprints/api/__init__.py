from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('api', __name__)
ld = LazyLoader(bp)

ld.url('data_user.get_current_user', ['/'], endpoint='index')

# MailBox
ld.url('data_excel_mail.today', ['/mailbox/today', '/mailbox/today/<int:year_offset>'])
ld.url('data_excel_mail.date', ['/mailbox/ymd', '/mailbox/ymd/<string:str_date>'])
ld.url('data_excel_mail.year_month', ['/mailbox/ym/<string:str_yearmonth>'])

# THANKQ
ld.url('data_thankq.payments', ['/tq/payments'])

ld.url('data_thankq.fys_summary', ['/tq/fys_summary'])

ld.url('data_thankq.source_code1_summary', ['/tq/source_code1_summary'])
ld.url('data_thankq.contact_created_fy', ['/tq/contact_created_fy'])
ld.url('data_thankq.new_customer_list', ['/merch/new_customers'])
ld.url('data_thankq.journey_cureone_acquisiton_donors', ['/campaign/journey_cureone_acquisition'])
ld.url('data_thankq.christmas_appeal_donors', ['/campaign/christmas_appeal'])

ld.url('data_thankq.get_first_date_source1_by_contacts_since', ['/tq/get_first_date_source1_by_contacts_since'])
ld.url('data_thankq.merch_activities', ['/tq/merch_activities'])

ld.url('data_thankq.fishing_pool', ['/tq/fishing_pool'])

ld.url('data_thankq.pledge_headers', ['/tq/pledges'])
ld.url('data_thankq.marketing_cycle', ['/marketing_cycle'])


# BUDGET
ld.url('data_budget.budget', ['/budget'])

# IIF
ld.url('data_iif.chart_of_account', ['/fin/chart_of_account'])
ld.url('data_iif.classes', ['/fin/classes'])

# Merchandise related APIs
ld.url('data_excel_merch.rex_rfm', ['/merch/rfm/<filename>'])
ld.url('data_excel_merch.rex_fulfilment_excels', ['/merch/fulfilment_excels'])
ld.url('data_excel_merch.rex_picking_slip', ['/merch/rex_picking_slip'])

# StarShipIt
ld.url('starshipit.search_orders', ['/ssi/orders/search', '/ssi/orders/search/<string:phrase>'])
ld.url('starshipit.get_order', ['/ssi/order/<int:order_id>'])
ld.url('starshipit.track_details', ['/ssi/track', '/ssi/track/<string:tracking_number>'])
ld.url('starshipit.get_unshipped_orders', ['/ssi/orders/unshipped', '/ssi/orders/unshipped/<string:since_order_date>'])
ld.url('starshipit.get_users_address_book', ['/ssi/addressbook'])
