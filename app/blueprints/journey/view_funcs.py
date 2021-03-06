from flask import request
from app.helper import use_template, request_arg
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
import app.tests as tests


@use_template('pledgecureone')
def cure_one():
	return dict(title='Cure One Journey')


@use_template('general_new_donor')
def general_new():
	return dict(title='New DonorJourney')


@use_template('cureone_acquisition', title='Cure One Acquisition')
def cure_one_acquisition():
	pass


@use_template('merch_new_customer')
def merchandise_new():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	d1, d2 = TLMA.fy_range(fy)
	# params = (Tq.format_date(d1), Tq.format_date(d2))
	updates = [('DATE_START', Tq.format_date(d1), '\''), ('DATE_END',  Tq.format_date(d2), '\'')]
	data = Tq.query('JOURNEY_NEW_MERCHANDISE_CUSTOMER', cached_timeout=30, updates=updates)
	return dict(title='Merchandise New Customer Journey', data=data, dates=(d1, d2), thisfy=fy, cost=TLMA.acquisition_cost)


@use_template('todo_christmas_appeal', title='Christmas Appeal')
def touch_point_christmas_appeal():
	pass
