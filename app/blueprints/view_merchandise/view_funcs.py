from flask import render_template, current_app, render_template, request, flash, redirect, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import os
from .rfm_calc import RFM, list_all_files as rfm_files
from app.helpers import templatified


def rfm_upload_allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS')


@templatified('homepage')
def homepage():
	return dict(title='Merchandise Overview')


@templatified('rfm_upload')
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
			save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
			if os.path.exists(save_path):
				flash('File {} already exists, and it will be replaced by the new upload'.format(filename), 'warning')
			file.save(save_path)
			flash('File {} was uploaded successfully'.format(filename), 'success')
			return redirect(request.url)

	elif request.method == 'GET':
		return dict(title='RFM Data', files=rfm_files())

	return dict(title='RFM Data')


@templatified('rfm_result')
def show_rfm_result_single(filename):
	data = RFM(filename).analysis()
	return dict(title='RFM Result', filename=filename, data=data)
