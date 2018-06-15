import os
from app.tlma import TLMA


def filter_currency(value):
	return "${:,.2f}".format(value)


def filter_datetime_au(value, fmt='%A %d %B %Y %H:%M:%S'):
	return value.strftime(fmt)


def filter_date_au(value, fmt='%d %B %Y'):
	return value.strftime(fmt)


def filter_month_name(value):
	import calendar
	return calendar.month_name[value] if isinstance(value, int) and value in range(1, 13) else 'undefined'


def filter_financial_year(value):
	return "FY{:d}".format(TLMA.fy(value))


def filter_2decimal(value, decimal=2):
	fmt = '{:.' + str(decimal) + 'f}'
	return fmt.format(value)


def filter_datetime_offset(value, year=0, month=0, day=0):
	return value.replace(year=value.year + year, month=value.month + month, day=value.day + day)


def filter_percentage(value, denominator, digits=2):
	return '{1:.{0}f}%'.format(digits, (value/denominator) * (10 ** digits)) if denominator != 0 else 'inf'


def filter_filename(value):
	return os.path.splitext(value)[0].split('\\')[-1] + os.path.splitext(value)[1]


def filter_email_name(value):
	name_part = str(value).rsplit('@', 2)[0]
	return name_part.title()[:-1] + name_part[-1].upper()


def filter_mail_excel_month(value):
	return value.rsplit('.', 2)[0][-6:-3].strip()


def request_endpoint_root(value):
	return value.rsplit('.', 1)[0].replace('.', '/')
