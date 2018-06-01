from app.blueprints.helpers import template_applied
from app.blueprints.module_api.data_funcs_mail import MailExcel
import os


@template_applied('homepage')
def homepage():
	return dict(title='Mailbox')


@template_applied()
def excels():
	excels = MailExcel.locate()
	excel_display = [(e.rsplit(os.path.sep, 3)[-2], e.rsplit(os.path.sep, 3)[-1]) for e in excels]
	folders = MailExcel.get_folder_tree()
	return dict(title='Mail Excels', folders = folders)
