class User:
	def __init__(self, identity, name, email, active=True):
		self.id = identity
		self.name = name
		self.email = email
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


users = {
	'anonymous': User('anonymous', 'Guest Anonymous', None)
}
