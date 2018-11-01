import re
import datetime


def is_zero(val, strip=True):
	try:
		val = int(str(val).strip()) if strip else int(str(val))
		return val == 0
	except ValueError:
		return False


def is_int(val, min_value=None, max_value=None, strip=True):
	try:
		int(str(val).strip()) if strip else int(str(val))
		res = True
		if not(min_value is None):
			res = res and res >= min_value
		if not (max_value is None):
			res = res and res <= min_value
		return res
	except ValueError:
		return False


def is_year(val, min_year=1000, max_year=9999, strip=True):
	try:
		val = int(str(val).strip()) if strip else int(str(val))
		return val in range(min_year, min(datetime.date.today().year + 100, max_year + 1))
	except ValueError:
		return False


def is_month(val, strip=True):
	try:
		val = int(str(val).strip()) if strip else int(str(val))
		return val in range(1, 13)
	except ValueError:
		return False


def is_valid_string(val, nosql=True, max_length=5000, strip=True):
	if not (val is None) or len(val.strip()) == 0:
		val = val.strip() if strip else val
		is_length_fit = len(val) in range(1, max_length + 1 if max_length != -1 else len(val) + 1)
		if nosql:
			return is_length_fit and re.match(r'(\s|\S)*select\s+(\s|\S)*[a-z]+(\s|\S)*\s+from\s+(\s|\S)*[a-z]+(\s|\S)*', val, re.IGNORECASE) is None
		return is_length_fit
	return False
