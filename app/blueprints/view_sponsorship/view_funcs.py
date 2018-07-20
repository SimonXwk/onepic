from app.helper import templatified
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA


def pledge_created_fys():
	data = Tq.query('PRIVENUE_PLEDGE_CREATED_FY', cached_timeout=300)
	return data.rows


@templatified()
def pledges(fy=TLMA.cfy):
	update = [('FY', fy)]
	data = Tq.query('PRIVENUE_PLEDGES', updates=update, cached_timeout=10)
	created_fys = pledge_created_fys()
	return dict(title='Pledge Overview', data=data, this_fy=fy, created_fys=created_fys)


@templatified()
def delinquency():
	return dict(title='Delinquency Check')
