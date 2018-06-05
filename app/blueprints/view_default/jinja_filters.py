import os
from app.tlma import TLMA


def add_jinja2_filters(mod):
	# Method 1 : using the method
	def filter_currency(value):
		return "${:,.2f}".format(value)

	mod.add_app_template_filter(filter_currency, name='currency')

	# Method 2 :  using the decorator
	@mod.app_template_filter('dtAU')
	def filter_datetime_au(value, fmt='%A %d %B %Y %H:%M:%S'):
		return value.strftime(fmt)

	@mod.app_template_filter('dAU')
	def filter_date_au(value, fmt='%d %B %Y'):
		return value.strftime(fmt)

	@mod.app_template_filter('mth')
	def filter_currency(value):
		import calendar
		return calendar.month_name[value] if isinstance(value, int) and value in range(1, 13) else 'undefined'

	@mod.app_template_filter('FY')
	def filter_financial_year(value):
		return "FY{:d}".format(TLMA.fy(value))

	@mod.app_template_filter('f')
	def filter_2decimal(value, decimal=2):
		format = '{:.' + str(decimal) + 'f}'
		return format.format(value)

	@mod.app_template_filter('dtOffset')
	def filter_datetime_offset(value, year=0, month=0, day=0):
		return value.replace(year=value.year + year, month=value.month + month, day=value.day + day)

	@mod.app_template_filter('pct')
	def filter_percentage(value, denominator, digits=2):
		return '{1:.{0}f}%'.format(digits, (value/denominator) * (10 ** digits)) if denominator != 0 else 'inf'

	@mod.app_template_filter('fname')
	def filter_filename(value):
		return os.path.splitext(value)[0].split('\\')[-1] + os.path.splitext(value)[1]

	@mod.app_template_filter('emailName')
	def filter_email_name(value):
		name_part = str(value).rsplit('@', 2)[0]
		return name_part.title()[:-1] + name_part[-1].upper()

	@mod.app_template_filter('mailmonth')
	def filter_mail_excel_month(value):
		return value.rsplit('.', 2)[0][-6:-3].strip()

	# @mod.app_template_filter('something')
	# def custom_sort(iterable, somearg):
	#     if iterable is None or isinstance(iterable, Undefined):
	#         return iterable
	#     # Do custom sorting of iterable here

	#     return iterable
