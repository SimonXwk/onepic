from flask import send_from_directory
import os
from app.helper import templatified
from app.cache import cached
from app.blueprints.api.data_mail import MailExcel


def excel_download(filename):
	file = os.path.join(MailExcel.excel_folder, filename)
	print(file)
	return send_from_directory(MailExcel.excel_folder, filename=filename)


@templatified('excels')
@cached(5)
def excel_list():
	# excels = MailExcel.locate_excel()
	# excel_display = [(e.rsplit(os.path.sep, 3)[-2], e.rsplit(os.path.sep, 3)[-1]) for e in excels]
	folders = MailExcel.get_folder_tree()
	return dict(title='Mail Excels', folders=folders)


@templatified('today', require_login=True)
def today():
	return dict(title='Mailbox-Daily')


@templatified('daily')
def daily():
	return dict(title='Mailbox-Daily')


@templatified('monthly')
def monthly():
	return dict(title='Mailbox-Monthly')




