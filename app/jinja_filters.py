import os
import datetime
from app.database.tlma import TLMA


def filter_currency(value):
	return "${:,.2f}".format(value) if value else "${:,.2f}".format(0)


def filter_number(value):
	return "{:,}".format(value) if value else 0


def filter_datetime_au(value, fmt='%A %d %B %Y %H:%M:%S'):
	return value.strftime(fmt) if value else None


def filter_date_au(value, fmt='%d %B %Y'):
	return value.strftime(fmt) if value else None


def filter_to_date(value, fmt=''):
	return datetime.datetime.strptime(value, fmt)


def filter_month_name(value, abbr=False):
	import calendar
	if abbr:
		return calendar.month_abbr[value] if isinstance(value, int) and value in range(1, 13) else 'undefined'
	return calendar.month_name[value] if isinstance(value, int) and value in range(1, 13) else 'undefined'


def filter_percentage(value, denominator, digits=2):
	if denominator == 0:
		return 'inf'
	elif value == denominator:
		return '100%'
	elif value == 0:
		return '0%'
	return '{1:.{0}f}%'.format(digits, (value/denominator) * (10 ** digits))


def filter_financial_year(value):
	return "{:d}".format(TLMA.fy(value)) if value else None


def filter_2decimal(value, decimal=2):
	fmt = '{:.' + str(decimal) + 'f}'
	return fmt.format(value)


def filter_datetime_offset(value, year=0, month=0, day=0):
	return value.replace(year=value.year + year, month=value.month + month, day=value.day + day)


def filter_filename(value):
	return os.path.splitext(value)[0].split('\\')[-1] + os.path.splitext(value)[1]


def filter_mail_excel_month(value):
	return value.rsplit('.', 2)[0][-6:-3].strip()
