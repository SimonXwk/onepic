from app.blueprints.helpers import template_applied
from app.tlma import TLMA


@template_applied('index')
def homepage():
	return dict(title='compendium', tlma=TLMA)
