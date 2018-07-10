from app.helpers import templatified
from app.database.odbc import ThankQODBC as tq
import datetime


@templatified('pledgecureone')
def cure_one():
	return dict(title='Cure One Journey')


@templatified('general_new_donor')
def general_new():
	return dict(title='New DonorJourney')


@templatified('merch_new_customer')
def merchandise_new():
	date1 = tq.date(datetime.date(2018 - 1, 7, 1))
	date2 = tq.date(datetime.date(2018, 6, 30))
	rows = tq.query('MERCH_NEW', date1, date2).rows
	return dict(title='Merchandise New Customer Journey', data=rows)
