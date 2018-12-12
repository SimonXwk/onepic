from app.helper import templatified
from app.database.iif import get_class_list_of_dicts, get_account_list_of_dicts
from app.database.mongo import Client


@templatified('scoping_fy20', title='FY20 Budget Scoping')
def scoping_fy20():
	pass


@templatified('chart_of_account', title='Chart of Account')
def chart_of_account():
	return dict(data=get_account_list_of_dicts())


@templatified('classes', title='Classes')
def classes():
	return dict(data=get_class_list_of_dicts())


@templatified('load_reckon_data', title='Load Reckon Data')
def load_reckon_data():
	mongo = Client(is_developer=False)
	with mongo:
		db = mongo.tlma
		mc = db['marketingcycle']
		marketing_cycles = mc.find({}, {'audit': 0})
		marketing_cycles = mongo.to_array(marketing_cycles)
	return dict(marketing_cycles=marketing_cycles)

