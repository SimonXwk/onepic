from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('misc', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.basic', ['/basic'])
ld.url('view_funcs.marketing_cycle', ['/marketing_cycle'])
ld.url('view_funcs.questions', ['/questions'])


