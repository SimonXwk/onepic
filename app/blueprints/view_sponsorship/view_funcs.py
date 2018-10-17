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


@templatified(title='Pledge Lifecycle')
def lifecycle():
	pass


@templatified(title='Sponsorship Overview')
def overview():
	fy = int(request_arg('fy', TLMA.cfy, tests.is_year))
	updates = [('FY', fy)]
	return dict(data=Tq.query(('PLEDGE_[BASE]', 'PLEDGE_OVERVIEW'),  cached_timeout=30, updates=updates), thisfy=fy)


@templatified(title='Delinquency Check')
def delinquency():
	data = dict()
	data['data'] = Tq.query(('PLEDGE_[BASE]', 'PLEDGE_DELINQUENCY'),  cached_timeout=10)
	data['general_warning_days'] = 90
	data['dd_warning_days'] = 20
	data['cc_warning_days'] = 5
	return data


@templatified(title='Pledge Overview')
def pledges(fy=TLMA.cfy):
	d1, d2 = TLMA.fy_range(fy)
	d2 = d2 + datetime.timedelta(days=1)
	d1, d2 = Tq.format_date((d1, d2))
	update = [('CREATED_START', d1, '\''), ('CREATED_END', d2, '\'')]
	data = Tq.query(('PLEDGE_[BASE]', 'PLEDGE_DETAIL'), updates=update, cached_timeout=15)
	fys = pledge_created_fys()
	return dict(data=data, this_fy=fy, fys=fys)


@templatified(title='Pledge Income')
def pledge_income_fy(fy=TLMA.cfy):
	d1, d2 = Tq.format_date(TLMA.fy_range(fy))
	update = [('DOP_START', d1, '\''), ('DOP_END', d2, '\'')]
	data = Tq.query(('PLEDGE_[BASE]', 'PLEDGE_INCOME'), updates=update, cached_timeout=25)
	fys = pledge_dop_fys()
	return dict(data=data, this_fy=fy, fys=fys)



