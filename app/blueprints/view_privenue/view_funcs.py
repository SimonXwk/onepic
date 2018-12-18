from flask import request
import datetime
from app.helper import use_template, request_arg
from app.database.odbc import ThankqODBC as Tq
from app.database.tlma import TLMA
import app.tests as tests


def date_of_payments_fy():
	data = Tq.query('LIST_FY_DATEOFPAYMENT', cached_timeout=600)
	return data.rows


@use_template('overview', title='Private Revenue Overview')
def overview():
	pass


@use_template('comparative', title='Comparative View')
def comparative():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	# Prepare for SQL parameters
	d1, d2 = TLMA.fy_range(fy)
	progress = (datetime.date.today() - d1).days / (d2 - d1).days

	# Run Query By including 2 financial years
	d1 = TLMA.fy_range(fy-1)[0]
	params = Tq.format_date((d1, d2))
	# updates = [('PAYMENT_DATE1', d1, '\''), ('PAYMENT_DATE2', d2, '\'')]
	data = Tq.query('PRIVENUE__BASE', *params, cached_timeout=180 )
	# Get Budget
	budget = TLMA.budget()
	return dict(cfy=fy, data=data, progress=progress, budget=budget)


@use_template('campaign_activity', title='Activities')
def campaign_activity():
	pass


@use_template('pending', title='Pending Batches')
def pending():
	from app.blueprints.api.data_privenue import pending_split, approved_split
	result = pending_split()
	has_pending = False if len(result['data']) == 0 else True
	if not has_pending:
		result = approved_split()
	return dict(results=result, has_pending=has_pending)


@use_template('sourcecode1_created', title='New Sourcecode 1')
def sourcecode1_created():
	# Prepare for SQL parameters
	d1, d2 = TLMA.ccy_date(TLMA.fy12m, 1), TLMA.cfy_end_date
	params = Tq.format_date((d1, d2))
	data = Tq.query('SOURCECODE_CREATED', *params, cached_timeout=10)
	return dict(data=data, d1=d1, d2=d2)


@use_template('sourcecode1_active', title='Active Sourcecode 1')
def sourcecode1_active():
	return {'data': Tq.query('SOURCECODE_ACTIVE', cached_timeout=10)}


@use_template('revenue_streams', title='Revenue Streams')
def revenue_streams():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	# Default to 3 minutes cache or else if the FY in URL is not CFY, then cache it for a longer period of time
	timeout = 180 if fy == TLMA.cfy else 2000
	# Prepare for SQL parameters
	d1, d2 = TLMA.fy_range(fy)
	params = Tq.format_date((d1, d2))
	# data = Tq.query(['PRIVENUE_REVENUE_STREAMS__BASE', 'PRIVENUE_REVENUE_STREAMS_UNION'], *params, cached_timeout=timeout)
	data = Tq.query('PRIVENUE_REVENUE_STREAMS__BASE', *params, cached_timeout=timeout)
	return dict(data=data, thisfy=fy, fys=date_of_payments_fy())


@use_template('single_campaign', title='Campaign Overview')
def single_campaign():
	fy = request_arg('fy', TLMA.cfy, type_func=int, test_func=tests.is_year)
	# Default to 10 minutes cache or else if the FY in URL is not CFY, then cache it for a longer period of time
	timeout = 600 if fy == TLMA.cfy else 2000

	# Prepare for SQL parameters
	d1, d2 = TLMA.fy_range(fy)
	params = Tq.format_date((d1, d2))
	campaign_codes = Tq.query('LIST_FY_CAMPAIGNCODES', *params, cached_timeout=timeout)

	# Default Values
	data = None

	# Update campaign_code if found argument from URL query string called 'campaign_code'
	campaign_code = request_arg('campaign_code', None, test_func=lambda x: tests.is_valid_string(x, nosql=True, max_length=50))

	if campaign_code is not None:
		update = [('CAMPAIGN_CODE', str(campaign_code), '\'')]
		data = Tq.query('PRIVENUE_SINGLE_CAMPAIGN', cached_timeout=200, updates=update)

	return dict(thisfy=fy, fys=date_of_payments_fy(), data=data, thiscampaign=campaign_code, campaigncodes=campaign_codes)
