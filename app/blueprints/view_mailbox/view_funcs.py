from app.blueprints.helpers import template_applied
from app.blueprints.module_api.data_mail import MailExcel
import os
from flask import send_from_directory


@template_applied('homepage')
def homepage():
	return dict(title='Mailbox')


@template_applied('excels')
def excel_list():
	# excels = MailExcel.locate_excel()
	# excel_display = [(e.rsplit(os.path.sep, 3)[-2], e.rsplit(os.path.sep, 3)[-1]) for e in excels]
	folders = MailExcel.get_folder_tree()
	return dict(title='Mail Excels', folders=folders)


def excel_download(filename):
	file = os.path.join(MailExcel.excel_folder, filename)
	print(file)
	return send_from_directory(MailExcel.excel_folder, filename=filename)
