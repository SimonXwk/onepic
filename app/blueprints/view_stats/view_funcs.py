from app.helper import templatified
import datetime
from app.database.tlma import TLMA
from app.database.odbc import ThankqODBC as Tq


@templatified('fishing_pool')
def fishing_pool():
	d1 = TLMA.cfy_start_date - datetime.timedelta(days=1)
	d2 = datetime.date.today()
	data = Tq.query('STATS_FISHING_POOL', cached_timeout=15)
	return dict(title='2 Year Fishing Pool', d1=d1, d2=d2, data=data)


@templatified('segments')
def segments():
	data = Tq.query('STATS_SEGMENT', cached_timeout=120)
	return dict(title='Segments', data=data)


@templatified('donor_types')
def donor_types():
	return dict(title='Donor Types')