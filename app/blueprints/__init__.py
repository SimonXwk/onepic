from .view_default import mod as mod_default
from .module_api import mod as mod_api
from .view_dictionary import mod as mod_dict
from .view_error import mod as mod_err
from .view_mailbox import mod as mod_mail
from .view_privenue import mod as mod_prv
from .view_merchandise import mod as mod_merch


class Blueprints:
	"""docstring for ClassName"""
	blueprints_views = {mod_default, mod_mail, mod_prv, mod_merch}
	blueprints_non_views = {mod_err, mod_dict, mod_api}

	@classmethod
	def register_blueprints(cls, app):
		for mod in cls.blueprints_views.union(cls.blueprints_non_views):
			app.register_blueprint(mod)
