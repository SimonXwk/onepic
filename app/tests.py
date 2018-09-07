import re
import datetime


def is_zero(val):
	if val is None:
		return False
	else:
		try:
			return int(val) == 0
		except ValueError:
			return False


def is_year(value):
	if not (value is None) and len(str(value).strip()) == 4:
		try:
			value = int(value.strip())
			if value in range(1000, min(datetime.date.today().year + 100, 9999)):
				return True
			return False
		except ValueError:
			return False
	return False


def is_month(value):
	if value is None:
		return False
	else:
		try:
			value = int(value.strip())
			if value in range(1, 13):
				return True
			return False
		except ValueError:
			return False


def is_valid_string(val, nosql=True, max_length=5000):
	if not (val is None) and len(val.strip()) in range(1, max_length + 1 if max_length != -1 else len(val) + 1):
		if nosql:
			if re.match(r'(\s|\S)*select\s+(\s|\S)*[a-z]+(\s|\S)*\s+from\s+(\s|\S)*[a-z]+(\s|\S)*', val, re.IGNORECASE) is None:
				return True
			return False
		return True
	return False
