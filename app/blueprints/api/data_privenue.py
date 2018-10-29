from app.database.odbc import ThankqODBC as tq
from marshmallow import Schema, fields
import datetime
from app.helper import jsonified


class FyTotalSchema(Schema):
	fy = fields.Integer()
	total = fields.Float(allow_none=True)


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