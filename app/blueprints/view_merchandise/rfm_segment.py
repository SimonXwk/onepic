undefined = {
	'name': 'Undefined',
	'segment_data': {
		'color': '#424242',
		'priority': 99,
		'definition': [{'xMin': None, 'xMax': None, 'yMin': None, 'yMax': None}]
	}

}


def calc_2d(ordered_segment, x, y):
	for key, value in ordered_segment:
		for bp in value.get('definition'):  # bp stands for a set of breakpoints (xMin, xMax, yMin, yMax as a dictionary)
			if (not bp['xMin'] or x >= bp['xMin']) and (not bp['xMax'] or x < bp['xMax']) and (not bp['yMin'] or y >= bp['yMin']) and (not bp['yMax'] or y < bp['yMax']):
				return key
	return undefined['name']


def sort_segment_by_key(segment_dict, sort_key, **kwargs):
	return sorted(segment_dict.items(), key=lambda kv: kv[1].get(sort_key), **kwargs)


class Segment1:
	segments = {
		'New Customers': {
			'color': '#CCFF00',
			'priority': 2,
			'definition': [{
				'xMin': 0,
				'xMax': 108,
				'yMin': 1,
				'yMax': 2
			}]
		},
		'Rising Customer': {
			'color': '#FFD54F',
			'priority': 3,
			'definition': [{
				'xMin': 0,
				'xMax': 54,
				'yMin': 2,
				'yMax': 4
			}]
		},
		'Stars': {
			'color': '#ba68c8',
			'priority': 1,
			'definition': [{
				'xMin': 0,
				'xMax': 54,
				'yMin': 4,
				'yMax': None
			}]

		},
		'Active': {
			'color': '#81C784',
			'priority': 4,
			'definition': [{
				'xMin': 54,
				'xMax': 108,
				'yMin': 2,
				'yMax': None
			}]
		},
		'Sleeping': {
			'color': '#3F51B5',
			'priority': 6,
			'definition': [{
				'xMin': 108,
				'xMax': None,
				'yMin': 1,
				'yMax': 3
			}]
		},
		'Falling': {
			'color': '#B0BEC5',
			'priority': 5,
			'definition': [{
				'xMin': 108,
				'xMax': 217,
				'yMin': 3,
				'yMax': None
			}]
		},
		'Alert': {
			'color': '#F44336',
			'priority': 7,
			'definition': [{
				'xMin': 217,
				'xMax': None,
				'yMin': 3,
				'yMax': None
			}]
		},
		undefined['name']: undefined['segment_data']
	}
	ordered_segment = sort_segment_by_key(segments, 'priority')

	@classmethod
	def calc(cls, row_raw):
		"""Calculate RFM Segment by given R, F and M score stored in the exact sequence in row (List/Tuple/Pandas.core.series)
		:param row_raw: the List/Tuple/Pandas.core.series contains R, F and M raw value in the exact order(R,F,M) / [R,F,M] / {index=[R,F,M], values}
		:return: Segment Name
		"""
		r, f, m = row_raw[0], row_raw[1], row_raw[2]
		return calc_2d(cls.ordered_segment, r, f)



class Segment2:
	segments = ('Champions', 'Loyal Customers', 'Potential Loyalist', 'Recent Customers',
	            'Promising', 'Customers Needing Attention', 'About To Sleep',
	            'At Risk', 'Can’t Lose Them', 'Hibernating', 'Lost', undefined)

	@classmethod
	def calc(cls, row):
		"""
		Calculate RFM Segment by given R, F and M score stored in the exact sequence in row (List/Tuple/Pandas.core.series)
		:param row: the List/Tuple/Pandas.core.series contains R, F and M score in the exact order(R,F,M) / [R,F,M] / {index=[R,F,M], values}
		:return: Segment Name
		"""
		r, f, m = row[0], row[1], row[2]
		fm = (f + m) / 2
		if 4 <= r <= 5 and 4 <= fm <= 5:
			return 'Champions'
		elif 2 <= r <= 5 and 3 <= fm <= 5:
			return 'Loyal Customers'
		elif 3 <= r <= 5 and 1 <= fm <= 5:
			return 'Potential Loyalist'
		elif 4 <= r <= 5 and 0 <= fm <= 1:
			return 'Recent Customers'
		elif 3 <= r <= 4 and 0 <= fm <= 1:
			return 'Promising'
		elif 2 <= r <= 3 and 2 <= fm <= 3:
			return 'Customers Needing Attention'
		elif 2 <= r <= 3 and 0 <= fm <= 2:
			return 'About To Sleep'
		elif 0 <= r <= 2 and 2 <= fm <= 5:
			return 'At Risk'
		elif 0 <= r <= 1 and 4 <= fm <= 5:
			return 'Can’t Lose Them'
		elif 1 <= r <= 2 and 1 <= fm <= 2:
			return 'Hibernating'
		elif 0 <= r <= 2 and 0 <= fm <= 2:
			return 'Lost'
		else:
			return undefined
