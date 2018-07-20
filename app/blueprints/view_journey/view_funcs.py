from app.helper import templatified
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA


@templatified('pledgecureone')
def cure_one():
	return dict(title='Cure One Journey')


@templatified('general_new_donor')
def general_new():
	return dict(title='New DonorJourney')


@templatified('merch_new_customer')
def merchandise_new():
	d1, d2 = TLMA.fy_range(TLMA.cfy)
	params = (Tq.format_date(d1), Tq.format_date(d2))
	data = Tq.query('NEW_CUSTOMER', *params, cached_timeout=20)
	return dict(title='Merchandise New Customer Journey', data=data, dates=(d1, d2))
