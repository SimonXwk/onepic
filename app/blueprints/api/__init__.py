from app.blueprints import MyBlueprint

bp = MyBlueprint(__name__)

# Add Url Rules (rule - endpoint - view function)
view_funcs_list = (
	dict(import_name='data_user.get_current_user', url_rules=['/'], endpoint='index'),

	# MailBox
	dict(import_name='data_excel_mail.today', url_rules=['/mailbox/today', '/mailbox/today/<int:year_offset>']),
	dict(import_name='data_excel_mail.date', url_rules=['/mailbox/ymd', '/mailbox/ymd/<string:str_date>']),
	dict(import_name='data_excel_mail.year_month', url_rules=['/mailbox/ym/<string:str_yearmonth>']),

	# THANKQ
	dict(import_name='data_thankq.payments', url_rules=['/tq/payments']),

	dict(import_name='data_thankq.fys_summary', url_rules=['/tq/fys_summary']),

	dict(import_name='data_thankq.source_code1_summary', url_rules=['/tq/source_code1_summary']),
	dict(import_name='data_thankq.contact_created_fy', url_rules=['/tq/contact_created_fy']),
	dict(import_name='data_thankq.new_customer_list', url_rules=['/merch/new_customers']),
	dict(import_name='data_thankq.journey_cureone_acquisiton_donors', url_rules=['/campaign/journey_cureone_acquisition']),
	dict(import_name='data_thankq.christmas_appeal_donors', url_rules=['/campaign/christmas_appeal']),

	dict(import_name='data_thankq.get_first_date_source1_by_contacts_since', url_rules=['/tq/get_first_date_source1_by_contacts_since']),
	dict(import_name='data_thankq.merch_activities', url_rules=['/tq/merch_activities']),

	dict(import_name='data_thankq.fishing_pool', url_rules=['/tq/fishing_pool']),
	dict(import_name='data_thankq.fishing_pool_sankey', url_rules=['/tq/fishing_pool_sankey']),

	dict(import_name='data_thankq.pledge_headers', url_rules=['/tq/pledges']),
	dict(import_name='data_thankq.pledge_types', url_rules=['/tq/pledge_types']),

	dict(import_name='data_thankq.marketing_cycle', url_rules=['/marketing_cycle']),

	# Mongo
	dict(import_name='data_mongo.get_marketing_cycles', url_rules=['/mongo/marketing_cycles']),

	# BUDGET
	dict(import_name='data_budget.budget', url_rules=['/budget']),

	# IIF
	dict(import_name='data_iif.chart_of_account', url_rules=['/fin/chart_of_account']),
	dict(import_name='data_iif.classes', url_rules=['/fin/classes']),

	# Merchandise related APIs
	dict(import_name='data_excel_merch.rex_rfm', url_rules=['/merch/rfm/<filename>']),
	dict(import_name='data_excel_merch.rex_fulfilment_excels', url_rules=['/merch/fulfilment_excels']),
	dict(import_name='data_excel_merch.rex_picking_slip', url_rules=['/merch/rex_picking_slip']),

	# StarShipIt
	dict(import_name='starshipit.search_orders', url_rules=['/ssi/orders/search', '/ssi/orders/search/<string:phrase>']),
	dict(import_name='starshipit.get_order', url_rules=['/ssi/order/<int:order_id>']),
	dict(import_name='starshipit.track_details', url_rules=['/ssi/track', '/ssi/track/<string:tracking_number>']),
	dict(import_name='starshipit.get_unshipped_orders', url_rules=['/ssi/orders/unshipped', '/ssi/orders/unshipped/<string:since_order_date>']),
	dict(import_name='starshipit.get_users_address_book', url_rules=['/ssi/addressbook']),
)
bp.register_lazy_urls(view_funcs_list)
