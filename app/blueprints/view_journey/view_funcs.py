from app.helpers import templatified
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
	params = (Tq.format_date(TLMA.cfy_start_date), Tq.format_date(TLMA.cfy_end_date))
	data = Tq.query('NEW_CUSTOMER', *params, cached_timeout=20)
	return dict(title='Merchandise New Customer Journey', data=data)
