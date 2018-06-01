from app.blueprints.helpers import template_applied
from ..module_api.resources import fy_total_all


@template_applied('homepage')
def homepage():
	result = fy_total_all()
	return dict(title='Private Revenue Overview', result=result)