from app.helpers import templatified
from app.database.tlma import TLMA


@templatified('index')
def homepage():
	return dict(title='compendium', tlma=TLMA)


@templatified('on_marketing_cycle')
def marketing_cycle():
	return dict(title='marketing cycle', data=TLMA.marketing_cycle)


@templatified('on_donor_type')
def donor_type():
	return dict(title='donor type')
