import datetime
from app.helper import templatified
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA


@templatified('homepage')
def homepage():
	today = datetime.date.today()
	d1, d2 = TLMA.cfy_start_date, TLMA.cfy_end_date
	progress = (today-d1).days/(d2-d1).days
	return dict(title='Private Revenue Overview', date_progress=progress*100)


@templatified('pending')
def pending():
	from app.blueprints.api.data_privenue import pending_split, approved_split
	result = pending_split()
	has_pending = False if len(result['data']) == 0 else True
	if not has_pending:
		result = approved_split()
	return dict(title='Pending Batches', results=result, has_pending=has_pending)


@templatified('sourcecode1')
def sourcecode1():
	d1, d2 = TLMA.ccy_date(TLMA.fy12m, 1), TLMA.cfy_end_date
	params = (Tq.format_date(d1), Tq.format_date(d2))
	data = Tq.query('SOURCECODE_CREATED', *params, cached_timeout=10)
	return dict(title='Source Code 1 Created', data=data, d1=d1, d2=d2)
