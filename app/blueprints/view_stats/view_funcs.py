from app.helper import templatified
from app.database.odbc import ThankqODBC as Tq


@templatified('fishing_pool', title="Finshing Pool")
def fishing_pool():
	pass


@templatified('segments')
def segments():
	data = Tq.query('STATS_SEGMENT', cached_timeout=120)
	return dict(title='Segments', data=data)


@templatified('donor_types')
def donor_types():
	return dict(title='Donor Types')


@templatified('contacts_snapshot')
def contacts_snapshot():
	data = Tq.query('STATS_CONTACTS', cached_timeout=10)
	return dict(title='Contacts', data=data)
