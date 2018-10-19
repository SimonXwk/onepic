from flask import request
from app.helper import templatified, request_arg
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
import app.tests as tests


@templatified('pledgecureone')
def cure_one():
	return dict(title='Cure One Journey')


@templatified('general_new_donor')
def general_new():
	return dict(title='New DonorJourney')


@templatified('cureone_acquisition', title='Cure One Acquisition')
def cure_one_acquisition():
	pass


@templatified('merch_new_customer')
def merchandise_new():
	fy = int(request_arg('fy', TLMA.cfy, tests.is_year))
	d1, d2 = TLMA.fy_range(fy)
	# params = (Tq.format_date(d1), Tq.format_date(d2))
	updates = [('DATE_START', Tq.format_date(d1), '\''), ('DATE_END',  Tq.format_date(d2), '\'')]
	data = Tq.query('JOURNEY_NEW_MERCHANDISE_CUSTOMER', cached_timeout=30, updates=updates)
	return dict(title='Merchandise New Customer Journey', data=data, dates=(d1, d2))
