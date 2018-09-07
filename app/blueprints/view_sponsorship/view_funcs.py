from flask import request
from app.helper import templatified, request_arg
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
import app.tests as tests
import datetime


def pledge_created_fys():
	data = Tq.query('LIST_FY_PLEDGE_CREATED', cached_timeout=600)
	return data.rows


def pledge_dop_fys():
	data = Tq.query('LIST_FY_DATEOFPAYMENT_SPONSORSHIP', cached_timeout=600)
	return data.rows


@templatified()
def overview():
	fy = int(request_arg('fy', TLMA.cfy, tests.is_year))
	updates = [('FY', fy)]
	data = Tq.query(('PLEDGE__BASE', 'PLEDGE_OVERVIEW'),  cached_timeout=30, updates=updates)
	return dict(title='Sponsorship Overview', data=data, thisfy=fy)


@templatified()
def pledges(fy=TLMA.cfy):
	d1, d2 = TLMA.fy_range(fy)
	d2 = d2 + datetime.timedelta(days=1)
	d1, d2 = Tq.format_date((d1, d2))
	update = [('CREATED_START', d1, '\''), ('CREATED_END', d2, '\'')]
	data = Tq.query(('PLEDGE__BASE', 'PLEDGE_DETAIL'), updates=update, cached_timeout=15)
	fys = pledge_created_fys()
	return dict(title='Pledge Overview', data=data, this_fy=fy, fys=fys)


@templatified()
def pledge_income_fy(fy=TLMA.cfy):
	d1, d2 = Tq.format_date(TLMA.fy_range(fy))
	update = [('DOP_START', d1, '\''), ('DOP_END', d2, '\'')]
	data = Tq.query(('PLEDGE__BASE', 'PLEDGE_INCOME'), updates=update, cached_timeout=25)
	fys = pledge_dop_fys()
	return dict(title='Pledge Income', data=data, this_fy=fy, fys=fys)


@templatified()
def delinquency():
	data = Tq.query(('PLEDGE__BASE', 'PLEDGE_DELINQUENCY'),  cached_timeout=10 )
	warning_days = 90
	return dict(title='Delinquency Check', data=data, warning_days=warning_days)
