from app.database.odbc import ThankqODBC as Tq
from app.api import ApiResult
from app.helper import request_arg
import app.tests as tests


def campaign_donors():
	campaign_code = request_arg('camapgincode', '%19AC.Cure%One%Acquisition%', lambda x: tests.is_valid_string(x, nosql=True, max_length=30))
	updates = [('CAMPAIGN_CODE', campaign_code, '\'')]
	results = Tq.query('JOURNEY_19CUREONE_ACQUISITION', cached_timeout=10, updates=updates)
	return ApiResult(results.to_json(), dump=False)
