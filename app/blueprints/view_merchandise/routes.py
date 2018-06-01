from flask import render_template, current_app, render_template, request, flash, redirect, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import os
from .rfm_calc import rfm_analysis as rfm, list_all_files as rfm_files


def rfm_upload_allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS')


def route(mod):
	@mod.route('/')
	def index():
		return render_template(mod.name + '/' + 'homepage.html', title='Merchandise Overview')

	@mod.route("/upload", methods=['GET', 'POST'])
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
			return render_template(mod.name + '/' + 'rfm_upload.html', files=rfm_files())

		return render_template(mod.name + '/' + 'rfm_upload.html')

	@mod.route('/rfm/<filename>')
	def show_rfm_single(filename):
		return render_template(mod.name + '/' + 'rfm_result.html', filename=filename)
