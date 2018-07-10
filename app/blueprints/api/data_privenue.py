from app.database.odbc import ThankQODBC as tq
from marshmallow import Schema, fields
import datetime
from app.helpers import jsonified


class FyTotalSchema(Schema):
	fy = fields.Integer()
	total = fields.Float(allow_none=True)


@jsonified
def fy_total_all():
	schema = FyTotalSchema()
	result = tq.query('FY_TOTAL', datetime.datetime.today().year+1)
	rows = result.rows
	data = dict(timestamp=result.timestamp, fy=[int(row.FY) if row.FY else 0 for row in rows], total=[float(row.TOTAL) if row.TOTAL else float(0) for row in rows])
	# data = schema.dump(data).data
	return data


@jsonified
def fy_total_all_ltd():
	result = tq.query('FY_TOTAL_LTD', datetime.datetime.today().year+1)
	rows = result.rows
	data = dict(timestamp=result.timestamp, fy=[int(row.FY) if row.FY else 0 for row in rows], total=[float(row.TOTAL) if row.TOTAL else float(0) for row in rows])
	return data


@jsonified
def cfy_platform_type_revenue():
	result = tq.query('PLATFORM_TO_TQTYPE_TOTAL')
	rows = result.rows
	data = dict(timestamp=result.timestamp, sankey=[(row.ATTR1, row.ATTR2, float(row.TOTAL)) for row in rows])
	return data


def pending_total():
	result = tq.query('PENDING_TOTAL')
	data = dict(total=result.rows[0].TOTAL, creators=result.rows[0].CREATEORS)
	return data


def pending_split():
	result = tq.query('PENDING_SPLIT')
	data = dict(timestamp=result.timestamp, data=result.rows)
	return data


def approved_split():
	result = tq.query('APPROVED_SPLIT')
	data = dict(timestamp=result.timestamp, data=result.rows)
	return data