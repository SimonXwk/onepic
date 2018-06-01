# from flask import jsonify
# from . import mod
# from ..mailbox.data import mail_today_offset, mail_this_week_offset

# api = Api(mod)
# ma = Marshmallow(mod)


# class DailyComparative(Resource):
# 	def get(self, back_days=0):
# 		return mail_today_offset(back_days)


# class WeeklyComparative(Resource):
# 	def get(self, back_weeks=0):
# 		return mail_this_week_offset(back_weeks)


# api.add_resource(DailyComparative, '/data_daily_mailbox/<int:back_days>', endpoint='data_daily_mailbox')
# api.add_resource(WeeklyComparative, '/data_weekly_mailbox/<int:back_back_weeks>', endpoint='data_weekly_mailbox')
#

from datetime import datetime

from app.database.odbc import ThankQODBC as Tq
from app.tlma import TLMA

from marshmallow import Schema, fields, post_load


class FyTotalSchema(Schema):
	fy = fields.String()
	total = fields.String()

	# @post_load
	# def create_fy_total(self, data):


def fy_total_all():
	schema = FyTotalSchema()
	result = Tq.query('FY_TOTAL', TLMA.fy(datetime.today()))
	rows = result.rows
	data = dict(fy=[row.FY for row in rows], total=[row.TOTAL for row in rows])
	print(schema.dump(data))
	return result


class TestSchema(Schema):
	admitname = fields.String()
	serialnumber = fields.String()
	paymentamount = fields.Float()
	sourcecode = fields.String()


def route(mod):
	@mod.route('/')
	def test():
		return "Done"
