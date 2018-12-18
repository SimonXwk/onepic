from flask import send_from_directory
import os
from app.helper import use_template
from app.cache import cached
from app.blueprints.api.data_excel_mail import MailExcel


def excel_download(filename):
	file = os.path.join(MailExcel.excel_folder, filename)
	print(file)
	return send_from_directory(MailExcel.excel_folder, filename=filename)


@use_template('excels')
@cached(5)
def excel_list():
	# excels = MailExcel.locate_excel()
	# excel_display = [(e.rsplit(os.path.sep, 3)[-2], e.rsplit(os.path.sep, 3)[-1]) for e in excels]
	folders = MailExcel.get_folder_tree()
	return dict(title='Mail Excels', folders=folders)


@use_template('today')
def today():
	return dict(title='Mailbox-Daily')


@use_template('daily')
def daily():
	return dict(title='Mailbox-Daily')


@use_template('monthly')
def monthly():
	return dict(title='Mailbox-Monthly')




