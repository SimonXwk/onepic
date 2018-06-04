from app.database.odbc import ThankQODBC as tq
from marshmallow import Schema, fields
import datetime
from app.blueprints.helpers import jsonified


class FyTotalSchema(Schema):
	fy = fields.Integer()
	total = fields.Float(allow_none=True)


@jsonified
def fy_total_all():
	schema = FyTotalSchema()
	result = tq.query('FY_TOTAL', datetime.datetime.today().year+1)
	rows = result.rows
	data = dict(fy=[int(row.FY) for row in rows], total=[float(row.TOTAL) for row in rows])
	# data = schema.dump(data).data
	print(data)
	return data


@jsonified
def fy_total_all_ltd():
	result = tq.query('FY_TOTAL_LTD', datetime.datetime.today().year+1)
	rows = result.rows
	data = dict(fy=[int(row.FY) for row in rows], total=[float(row.TOTAL) for row in rows])
	print(data)
	return data
