from flask import request
import datetime
from app.helper import templatified
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA


def date_of_payments_fy():
	data = Tq.query('LIST_FY_DATEOFPAYMENT', cached_timeout=600)
	return data.rows


@templatified('homepage')
def homepage():
	today = datetime.date.today()
	d1, d2 = TLMA.cfy_start_date, TLMA.cfy_end_date
	progress = (today-d1).days/(d2-d1).days
	return dict(title='Private Revenue Overview', date_progress=progress*100)


@templatified('pending')
def pending():
	from app.blueprints.api.data_privenue import pending_split, approved_split
	result = pending_split()
	has_pending = False if len(result['data']) == 0 else True
	if not has_pending:
		result = approved_split()
	return dict(title='Pending Batches', results=result, has_pending=has_pending)


@templatified('sourcecode1')
def sourcecode1():
	# Prepare for SQL parameters
	d1, d2 = TLMA.ccy_date(TLMA.fy12m, 1), TLMA.cfy_end_date
	params = Tq.format_date((d1, d2))
	data = Tq.query('SOURCECODE_CREATED', *params, cached_timeout=10)
	return dict(title='Source Code 1 Created', data=data, d1=d1, d2=d2)


@templatified('revenue_streams')
def revenue_streams():
	fy, timeout = TLMA.cfy, 180  # Default to current financial year and cache for 3 minutes
	# Update the FY if found argument from URL query string called 'fy'
	arg = request.args.get('fy')
	if arg and len(arg.strip()) == 4:
		fy = int(arg)
		# If the FY in URL is not CFY, then cache it for a longer period of time
		if fy != TLMA.cfy:
			timeout = 2000
	# Prepare for SQL parameters
	d1, d2 = TLMA.fy_range(fy)
	params = Tq.format_date((d1, d2))
	# data = Tq.query(['PRIVENUE_REVENUE_STREAMS__BASE', 'PRIVENUE_REVENUE_STREAMS_UNION'], *params, cached_timeout=timeout)
	data = Tq.query('PRIVENUE_REVENUE_STREAMS__BASE', *params, cached_timeout=timeout)
	return dict(title='Revenue Streams', data=data, thisfy=fy, fys=date_of_payments_fy())
