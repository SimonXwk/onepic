from app.blueprints.helpers import template_applied
from app.blueprints.module_api.data_privenue import fy_total_all


@template_applied('homepage')
def homepage():
	return dict(title='Private Revenue Overview')
