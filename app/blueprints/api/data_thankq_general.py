from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
from app.api import ApiResult, ApiException


def payments():
	d1, d2 = TLMA.fy_range(TLMA.cfy)
	updates = [('PAYMENT_DATE1', Tq.format_date(d1), '\''), ('PAYMENT_DATE2', Tq.format_date(d2), '\'')]
	results = Tq.query('PAYMENTS', cached_timeout=120, updates=updates)
	return ApiResult(results.to_json(), dump=False)
