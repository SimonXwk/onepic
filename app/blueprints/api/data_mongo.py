from app.api import ApiResult, ApiException
from app.database.mongo import Client


def get_marketing_cycles():
	mongo = Client(is_developer=False)
	with mongo:
		db = mongo.tlma
		mc = db['marketingcycle']
		marketing_cycles = mc.find({}, {'auditTrail': 0})
	return ApiResult(mongo.to_array(marketing_cycles))
