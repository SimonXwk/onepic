import os
import datetime
from math import inf, nan
from app.database.tlma import TLMA


def format_currency(value):
	if value == inf or value == nan:
		return value
	return "${:,.2f}".format(value) if value else "${:,.2f}".format(0)


def format_number(value):
	if value == inf or value == nan:
		return value
	return "{:,}".format(value) if value else 0


def division(value, denominator):
	if denominator is None:
		return nan
	elif denominator == 0:
		return inf
	else:
		try:
			return float(value)/float(denominator)
		except ValueError:
			return nan


def percentage(value, denominator, digits=2):
	if denominator == 0:
		return inf
	elif value == denominator:
		return '100%'
	elif value == 0:
		return '0%'
	try:
		return '{1:.{0}f}%'.format(digits, (float(value) / float(denominator)) * (10 ** digits))
	except ValueError:
		return nan


def format_datetime_au(value, fmt='%A %d %B %Y %H:%M:%S'):
	return value.strftime(fmt) if value else None


def format_date_au(value, fmt='%d %B %Y'):
	return value.strftime(fmt) if value else None


def format_date_sort(value, fmt='%Y-%m-%d'):
	return value.strftime(fmt) if value else None


def format_datetime_sort(value, fmt='%Y-%m-%d %H:%M:%S'):
	return value.strftime(fmt) if value else None


def filter_to_date(value, fmt=''):
	return datetime.datetime.strptime(value, fmt)


def filter_month_name(value, abbr=False):
	import calendar
	if abbr:
		return calendar.month_abbr[value] if isinstance(value, int) and value in range(1, 13) else 'undefined'
	return calendar.month_name[value] if isinstance(value, int) and value in range(1, 13) else 'undefined'


def filter_add_working_days(value, add_days):
	if isinstance(add_days, int):
		move = 1 if add_days > 0 else -1
		while abs(add_days) > 0:
			value += datetime.timedelta(days=move)
			if value.weekday() > 4:
				continue
			add_days -= move
		return value
	return value


def filter_financial_year(value):
	return "{:d}".format(TLMA.fy(value)) if value else None


def financial_year_month(value):
	return TLMA.fy_mth(value)


def filter_datetime_offset(value, year=0, month=0, day=0):
	return value.replace(year=value.year + year, month=value.month + month, day=value.day + day)


def filter_filename(value):
	return os.path.splitext(value)[0].split('\\')[-1] + os.path.splitext(value)[1]


def filter_mail_excel_month(value):
	return value.rsplit('.', 2)[0][-6:-3].strip()
