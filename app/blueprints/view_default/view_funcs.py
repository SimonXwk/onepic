from flask import flash, redirect
from app.helper import templatified
from flask_login import login_user, logout_user, current_user
from app.user import anonymous_user


@templatified('index')
def index():
	if current_user.is_authenticated:
		redirect('/logged')
	return dict(title='OnePic')


@templatified('logged', require_login=True)
def logged():
	return dict(title='Logged')


def login_as_guest():
	login_user(anonymous_user)
	return redirect('/logged')


def logout():
	logout_user()
	flash('logout successfully', 'success')
	return redirect('/')


# def login():
# 	if request.method == 'POST':
# 		usr = request.form['username']
# 		pwd = request.form['password']
# 		if usr != '' and pwd != '':
# 			session['user_name'] = usr
# 			return redirect('/logged')
# 		elif usr is None and pwd is None:
# 			flash('empty fields')
# 		else:
# 			flash('wrong login detail', 'error')
# 	return redirect('/')


@templatified('test')
def test():
	from datetime import datetime
	from app.database.flasksqlalchemy_model import PledgeInstalmentsActive as Md
	d = Md.query.filter(Md.datedue <= (datetime(year=2018, month=4, day=30, hour=0, minute=0, second=0, microsecond=0)))\
		.all()

	from app.database.sqlalchemy_database import pledge_header as Md
	d = Md.select(Md.c.STARTDATE >= (datetime(year=2018, month=4, day=30, hour=0, minute=0, second=0, microsecond=0)))\
		.execute().first()

	d = d['PLEDGEID']

	# from .model_vanilla import sa, Session, BatchHeader, BatchItem, BatchItemSplit
	# session = Session()`
	# d = session.query(BatchItemSplit)\
	# 	.join(BatchItem, sa.and_(BatchItemSplit.admitname == BatchItem.admitname, BatchItemSplit.receiptno == BatchItem.receiptno, BatchItemSplit.serialnumber == BatchItem.serialnumber)) \
	# 	.join(BatchHeader, BatchItemSplit.admitname == BatchHeader.admitname)\
	# 	.filter(BatchHeader.created >= (datetime(year=2018, month=4, day=26, hour=0, minute=0, second=0, microsecond=0))) \
	# 	.filter(sa.or_(BatchItem.reversed.is_(None), sa.and_(BatchItem.reversed != 1, BatchItem.reversed != -1))) \
	# 	.all()
	# session.close()

	return dict(title='test page', data=d)
