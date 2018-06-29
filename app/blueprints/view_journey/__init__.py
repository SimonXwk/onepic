from app.helpers import create_blueprint, LazyLoader

bp = create_blueprint('journey', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.general_new', ['/merchandise_new'])
ld.url('view_funcs.merchandise_new', ['/general_new'])
ld.url('view_funcs.cure_one', ['/cureone'])
