from flask import render_template, current_app, render_template, request, flash, redirect, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import os
from .rfm_calc import list_all_files as rfm_files
from app.database.tlma import TLMA
from app.helper import use_template, request_arg
import app.tests as tests


def rfm_upload_allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS')


@use_template('rfm_upload', title='RFM DATA')
def upload():
	if request.method == 'POST':
		# check if the post request has the file part
		if 'file' not in request.files:
			flash('No file part exist in the request', 'error')
			return redirect(request.url)
		# msg = """<div class="alert alert-danger" role="alert">No file part</div>"""
		# render_template('index.html', msg=msg)
		file = request.files['file']

		# if user does not select file, browser also
		# submit an empty part without filename
		if file.filename == '':
			flash('No file Selected', 'warning')
			return redirect(request.url)
		# msg = """<div class="alert alert-danger" role="alert">You didn't select any file</div>"""
		# render_template('index.html', msg=msg)

		if file and rfm_upload_allowed_file(file.filename):
			filename = secure_filename(file.filename)
			save_path = os.path.join(current_app.config['MERCHANDISE_RFM_UPLOAD_FOLDER'], filename)
			if os.path.exists(save_path):
				flash('File {} already exists, and it will be replaced by the new upload'.format(filename), 'warning')
			file.save(save_path)
			flash('File {} was uploaded successfully'.format(filename), 'success')
			return redirect(request.url)

	elif request.method == 'GET':
		return dict(files=rfm_files())

	return None


@use_template('rfm_result')
def rfm_result(filename):
	return dict(filename=filename)


@use_template('starshipit_shipped_orders')
def track_shipped_order(order_number=None):
	order_number = order_number.strip() if order_number else None
	if not order_number or len(order_number) != 11:
		return None
	return dict(order_number=order_number)


@use_template('starshipit_unshipped_orders')
def list_unshipped_orders(order_number=None):
	return dict(order_number=order_number)


@use_template('merch_new_customer_courtesy_call', title='Merch Courtesy Call')
def merchandise_new_courtesy_call():
	pass


@use_template('merch_new_customer_welcome_pack', title='Merch Welcome Pack')
def merchandise_new_welcome_pack():
	pass


@use_template('merch_revenue_overview', title='Merch Revenue')
def merchandise_revenue_overview():
	pass


@use_template('merchandise_activity', title='Merch Activity')
def merchandise_activity():
	pass
