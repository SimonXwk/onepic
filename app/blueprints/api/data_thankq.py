from app.database.odbc import ThankqODBC as TQ
from app.database.tlma import TLMA
from app.api import ApiResult, ApiException


def payments():
	d1, d2 = TLMA.cfy_start_date, TLMA.cfy_end_date
	params = TQ.format_date((d1, d2))
	results = TQ.query('PAYMENTS', *params, cached_timeout=120)
	return ApiResult(results.to_json())
