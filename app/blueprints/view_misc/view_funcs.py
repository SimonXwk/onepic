from app.helper import templatified
from app.database.tlma import TLMA


@templatified('basic', title='compendium')
def basic():
	return dict(tlma=TLMA)


@templatified('marketing_cycle', title='marketing cycle')
def marketing_cycle():
	return dict(data=TLMA.marketing_cycle)


@templatified('questions', title='Historical Questions')
def questions():
	pass
