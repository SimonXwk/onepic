from app.helpers import templatified
from app.tlma import TLMA


@templatified('index')
def homepage():
	return dict(title='compendium', tlma=TLMA)
