from app.blueprints.helpers import template_applied
import datetime


@template_applied('homepage')
def homepage():
	today = datetime.date.today()
	d1 = datetime.date(today.year-1 if today.month < 7 else today.year, 7, 1)
	d2 = datetime.date(today.year if today.month < 7 else today.year+1, 6, 30)
	progress = (today-d1).days/(d2-d1).days
	from app.blueprints.module_api.data_privenue import pending_total
	return dict(title='Private Revenue Overview', date_progress=progress*100, pending=pending_total())
