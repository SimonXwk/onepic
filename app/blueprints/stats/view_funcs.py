from app.helper import use_template
from app.database.odbc import ThankqODBC as Tq


@use_template('fishing_pool', title="Finshing Pool")
def fishing_pool():
	pass


@use_template('segments')
def segments():
	data = Tq.query('STATS_SEGMENT', cached_timeout=120)
	return dict(title='Segments', data=data)


@use_template('donor_types')
def donor_types():
	return dict(title='Donor Types')


@use_template('contacts_snapshot')
def contacts_snapshot():
	data = Tq.query('STATS_CONTACTS', cached_timeout=10)
	return dict(title='Contacts', data=data)
