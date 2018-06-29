import datetime
from app.helpers import templatified


@templatified('homepage')
def homepage():
	today = datetime.date.today()
	d1 = datetime.date(today.year-1 if today.month < 7 else today.year, 7, 1)
	d2 = datetime.date(today.year if today.month < 7 else today.year+1, 6, 30)
	progress = (today-d1).days/(d2-d1).days
	# from app.blueprints.api.data_privenue import pending_total
	return dict(title='Private Revenue Overview', date_progress=progress*100)


@templatified('pending')
def pending():
	from app.blueprints.api.data_privenue import pending_split, approved_split
	result = pending_split()
	has_pending = False if len(result['data']) == 0 else True
	if not has_pending:
		result = approved_split()
	return dict(title='Pending Batches', results=result, has_pending=has_pending)
