from . import data_mail as mail
from . import data_merch as merch
from . import data_privenue as pv


def map_url(mod):
	mod.add_url_rule('/', endpoint='index', view_func=mail.home)
	mod.add_url_rule('/mailbox/ymd', view_func=mail.date)
	mod.add_url_rule('/mailbox/ymd/<string:str_date>', view_func=mail.date)
	mod.add_url_rule('/mailbox/ym/<string:str_yearmonth>', view_func=mail.year_month)

	mod.add_url_rule('/cash/fys', view_func=pv.fy_total_all)
	mod.add_url_rule('/cash/fysltd', view_func=pv.fy_total_all_ltd)

	mod.add_url_rule('/merch/new/fy/<int:fy>', view_func=merch.new_fy)
	mod.add_url_rule('/merch/new/cfy/<int:month>', view_func=merch.new_cfy_month)
