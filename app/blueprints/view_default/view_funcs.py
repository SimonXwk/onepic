from flask import request, session, flash, redirect
from app.blueprints.helpers import template_applied


@template_applied('index')
def index():
	return dict(title='Home')


@template_applied('test')
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


def login():
	if request.method == 'POST':
		usr = request.form['username']
		pwd = request.form['password']
		if usr != '' and pwd != '':
			session['user_name'] = usr
		elif usr is None and pwd is None:
			flash('empty fields')
		else:
			flash('wrong login detail', 'error')
	return redirect('/')


def logout():
	session['user_name'] = None
	flash('logout successfully', 'success')
	return redirect('/')
