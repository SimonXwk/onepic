from . import data_funcs_mail as mail
from . import data_merch as merch


def map_url(mod):
	mod.add_url_rule('/', endpoint='index', view_func=mail.home)
	mod.add_url_rule('/mailbox/ymd', view_func=mail.date)
	mod.add_url_rule('/mailbox/ymd/<string:str_date>', view_func=mail.date)
	mod.add_url_rule('/mailbox/ym/<string:str_yearmonth>', view_func=mail.year_month)

	mod.add_url_rule('/merch/new/fy/<int:fy>', view_func=merch.new_fy)
	mod.add_url_rule('/merch/new/cfy/<int:month>', view_func=merch.new_cfy_month)
