import datetime
from app.helpers import templatified
from app.database.odbc import ThankqODBC as Tq


@templatified('homepage')
def homepage():
	today = datetime.date.today()
	d1 = datetime.date(today.year-1 if today.month < 7 else today.year, 7, 1)
	d2 = datetime.date(today.year if today.month < 7 else today.year+1, 6, 30)
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
	today = datetime.date.today()
	d1 = datetime.date(today.year - 1 if today.month < 7 else today.year, 6, 1)
	d2 = datetime.date(today.year if today.month < 7 else today.year + 1, 6, 30)
	rows = Tq.query('SOURCECODE_CREATED', Tq.format_date(d1), Tq.format_date(d2), cached_timeout=10)
	return dict(title='Source Code 1 Created', data=rows, d1=d1, d2=d2)
