def is_zero(value):
	if value is None:
		return False
	else:
		try:
			return int(value) == 0
		except ValueError:
			return False
