from app.blueprints.helpers import templated
from app.tlma import TLMA


@templated('index')
def homepage():
	return dict(title='compendium', tlma=TLMA)
