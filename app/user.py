class User:
	def __init__(self, user_dict, active=True):
		self.id = user_dict['id']
		self.name = user_dict['name']
		self.email = user_dict.get('email', None)

		self.user_dict = user_dict

		self.active = active
		self.anonymous = False
		self.authenticated = True

	def get_id(self):
		return self.id

	def is_authenticated(self):
		pass

	def is_active(self):
		""""""
		# True: Assume all users are active
		return self.active

	def is_anonymous(self):
		""""""
		# False: Anonymous users aren't supported
		return self.anonymous


anonymous_user = User(dict(id='anonymous', name='Guest Anonymous'), None)
