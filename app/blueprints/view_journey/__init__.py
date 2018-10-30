from app.helper import create_blueprint, LazyLoader

bp = create_blueprint('journey', __name__)
ld = LazyLoader(bp)

# LazyLoading View Functions
ld.url('view_funcs.cure_one', ['/cureone'])
ld.url('view_funcs.cure_one_acquisition', ['/cureone_acquisition'])
ld.url('view_funcs.general_new', ['/general_new'])
ld.url('view_funcs.merchandise_new', ['/merchandise_new'])

ld.url('view_funcs.touch_point_christmas_appeal', ['/touch_point_christmas_appeal'])



