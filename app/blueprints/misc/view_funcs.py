from app.helper import use_template
from app.database.tlma import TLMA


@use_template('basic', title='compendium')
def basic():
	return dict(tlma=TLMA)


@use_template('marketing_cycle', title='marketing cycle')
def marketing_cycle():
	return dict(data=TLMA.marketing_cycle)


@use_template('questions', title='Historical Questions')
def questions():
	pass
