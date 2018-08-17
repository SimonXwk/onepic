from flask import request
from app.helper import templatified
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA


@templatified('pledgecureone')
def cure_one():
	return dict(title='Cure One Journey')


@templatified('general_new_donor')
def general_new():
	return dict(title='New DonorJourney')


@templatified('cureone_acquisition')
def cure_one_acquisition():
	arg_name = 'CampaignCode'
	campaign_code = '19AC.Cure One Acquisition'
	campaign_code = '19DV.August Appeal'

	# if not request.view_args[arg_name]:
	# 	campaign_code = request.view_args[arg_name]

	return dict(title='Cure One Acquisition')


@templatified('merch_new_customer')
def merchandise_new():
	d1, d2 = TLMA.fy_range(TLMA.cfy)
	# params = (Tq.format_date(d1), Tq.format_date(d2))
	updates = [('START_DATE', '\'' + Tq.format_date(d1) + '\''), ('END_DATE', '\'' + Tq.format_date(d2) + '\'')]
	data = Tq.query('JOURNEY_NEW_MERCHANDISE_CUSTOMER', cached_timeout=20, updates=updates)
	return dict(title='Merchandise New Customer Journey', data=data, dates=(d1, d2))
