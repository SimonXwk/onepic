from app.helper import templatified


@templatified('scoping_fy20')
def scoping_fy20():
	return dict(title='FY20 Budget Scoping')
