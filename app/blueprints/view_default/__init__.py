from app.helpers import create_blueprint, LazyLoader

bp = create_blueprint('default', __name__, prefixed=False)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.index', ['/'])
ld.url('view_funcs.test', ['/test'])
ld.url('view_funcs.login', ['/login'], methods=['POST'])
ld.url('view_funcs.logout', ['/logout'])


# App context
@bp.app_context_processor
def inject_now():
	from datetime import datetime
	return dict(now=datetime.now())
