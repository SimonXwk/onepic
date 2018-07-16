from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from flask import current_app

# Get URI : This must be within the app context
uri = current_app.config.get('SQLALCHEMY_DATABASE_URI')

# Create Engine
engine = create_engine(uri, convert_unicode=True)

# create a  module-level "Session" class
session_factory = sessionmaker()
# connect engine to the Session using configure():
session_factory.configure(bind=engine, autoflush=False, autocommit=False)
# The scoped_session function, which provides a thread-safe session, expects a factory function
db_session = scoped_session(session_factory)

# create a Declarative base class which stores the classes representing tables
Base = declarative_base()
Base.query = db_session.query_property()
Base.metadata.reflect(bind=engine)

# create meta Data
metadata = MetaData(bind=engine)


def table(tbl_name):
	if '_LIVE' not in uri.upper():
		tbl_name = 'TBL_' + tbl_name
	return Table(tbl_name, metadata, autoload=True)


""" Database system (and SQL) abstraction layer
"""
#  Contact
contact = table('CONTACT')

#  Pledge
pledge_header = table('PLEDGEHEADER')
pledge_header_attribute = table('PLEDGEHEADERATTRIBUTE')
pledge_header_relationship = table('PLEDGEHEADERRELATIONSHIP')
pledge_destination = table('PLEDGEDESTINATION')

pledge_instalment_active = table('PLEDGEINSTALMENTS_ACTIVE')
pledge_instalment_closed = table('PLEDGEINSTALMENTS_CLOSED')
pledge_instalment_writtenoff = table('PLEDGEINSTALMENTS_WRITTENOFF')
pledge_instalments_failure = table('PLEDGEINSTALMENTS_FAILURE')
pledge_instalments_nextactive = table('PLEDGEINSTALMENTS_NEXTACTIVE')
