from app.helpers import templatified
from app.database.odbc import ThankqODBC as TQ
from app.database.tlma import TLMA
import datetime


@templatified('pledgecureone')
def cure_one():
	return dict(title='Cure One Journey')


@templatified('general_new_donor')
def general_new():
	return dict(title='New DonorJourney')


@templatified('merch_new_customer')
def merchandise_new():
	date1, date2 = TQ.format_date(TLMA.fy_start_date), TQ.format_date(TLMA.fy_end_date)
	data = TQ.query('NEW_CUSTOMER', *(date1, date2), cached_timeout=20)
	return dict(title='Merchandise New Customer Journey', data=data)
