from app.helper import templatified
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA


def pledge_created_fys():
	data = Tq.query('LIST_FY_PLEDGE_CREATED', cached_timeout=600)
	return data.rows


def pledge_dop_fys():
	data = Tq.query('LIST_FY_DATEOFPAYMENT_SPONSORSHIP', cached_timeout=600)
	return data.rows


@templatified()
def pledges(fy=TLMA.cfy):
	update = [('FY', fy)]
	data = Tq.query(['PLEDGE_BASE', 'PLEDGES_DETAIL'], updates=update, cached_timeout=10)
	fys = pledge_created_fys()
	return dict(title='Pledge Overview', data=data, this_fy=fy, fys=fys)


@templatified()
def pledge_income(fy=TLMA.cfy):
	update = [('FY', fy)]
	data = Tq.query(['PLEDGE_BASE', 'PLEDGE_INCOME'], updates=update, cached_timeout=25)
	fys = pledge_dop_fys()
	return dict(title='Pledge Income', data=data, this_fy=fy, fys=fys)


@templatified()
def delinquency():
	return dict(title='Delinquency Check')
