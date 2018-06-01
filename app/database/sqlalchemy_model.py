import sqlalchemy as sa
from .sqlalchemy_database import Base


class Object(Base):
	__tablename__ = 'TBL_OBJECT'
	""" CONSTRAINT PK_OBJECT
	PRIMARY KEY (ADMITNAME)
	"""
	admitname = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	stageid = sa.Column(sa.Float, index=True)  # ! Important
	owner = sa.Column(sa.String(50))
	admittype = sa.Column(sa.String(20), index=True)  # ! Important, BATCHHEADER/DATAIMPORT/MAILINGHEADER/ORDERHEADER
	filename = sa.Column(sa.String(50))
	filepath = sa.Column(sa.String(255))
	title = sa.Column(sa.String(80))
	subject = sa.Column(sa.String(50))
	author = sa.Column(sa.String(50))
	keywords = sa.Column(sa.String(50))
	comments = sa.Column(sa.String(255))
	created = sa.Column(sa.DateTime)  # Audit Information
	removed = sa.Column(sa.DateTime, index=True)  # Audit Information
	modified = sa.Column(sa.DateTime, index=True)  # Audit Information
	""" Relationships """

	def __repr__(self):
		return "<Object {} Type {} stage id {}>".format(
			self.admitname, self.admittype, self.stageid)


class Stage(Base):
	__tablename__ = 'TBL_STAGE'
	""" CONSTRAINT PK_STAGE
	PRIMARY KEY (STAGEID)
	"""
	stageid = sa.Column(sa.Float, primary_key=True, nullable=False, index=True)
	stage = sa.Column(sa.String(50), index=True)
	stagealias = sa.Column(sa.String(50))
	description = sa.Column(sa.String(50))
	history = sa.Column(sa.SmallInteger, nullable=False, default=0)  # (mssql:bit) Yes(-1)/No(0, Null)/Error(other)
	""" Relationships """

	def __repr__(self):
		return "<Stage {} {} history {}>".format(
			self.stageid, self.stage, self.history)


class BatchHeader(Base):
	__tablename__ = 'TBL_BATCHHEADER'
	""" CONSTRAINT PK_BATCHHEADER
	PRIMARY KEY (ADMITNAME, OWNERCODE)
	"""
	admitname = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	batchtype = sa.Column(sa.String(50), index=True)  # ! Important
	batchdescription = sa.Column(sa.String(255), index=True)  # ! Important
	currency = sa.Column(sa.String(25))
	expectednumberofitems = sa.Column(sa.Float)
	expectedvalue = sa.Column(sa.Float)  # (mssql:money)
	accountreference = sa.Column(sa.String(25), index=True)  # ! Important
	payinginreference = sa.Column(sa.String(25))  # ! Important
	senttoaccounts = sa.Column(sa.SmallInteger)
	receiptsprepared = sa.Column(sa.SmallInteger)
	defaultdateofpayment = sa.Column(sa.DateTime)
	defaultpaymenttype = sa.Column(sa.String(25))
	defaultpaymentamount = sa.Column(sa.Float)  # (mssql:money)
	defaulttaxclaimable = sa.Column(sa.String(4))
	defaultreceiptrequired = sa.Column(sa.String(4))
	defaultdestination = sa.Column(sa.String(25))
	defaultdestination2 = sa.Column(sa.String(25))
	defaultsource = sa.Column(sa.String(25), index=True)
	defaultsource2 = sa.Column(sa.String(25))
	defaultcampaignyear = sa.Column(sa.Integer)
	defaultincludetextrule = sa.Column(sa.String(50))
	approved = sa.Column(sa.DateTime, index=True)  # Audit Information
	approvedby = sa.Column(sa.String(50), index=True)  # Audit Information
	created = sa.Column(sa.DateTime, index=True)  # Audit Information
	createdby = sa.Column(sa.String(50), index=True)  # Audit Information
	modified = sa.Column(sa.DateTime, index=True)  # Audit Information
	modifiedby = sa.Column(sa.String(50), index=True)  # Audit Information
	currentlyeditedby = sa.Column(sa.String(50))
	defaultreceiptsummary = sa.Column(sa.String(3), index=True)
	submitted = sa.Column(sa.DateTime, index=True)  # Audit Information
	submittedby = sa.Column(sa.String(50), index=True)  # Audit Information
	fundstatscalculated = sa.Column(sa.SmallInteger, index=True)
	notes = sa.Column(sa.String(8000))
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	eftsubmitted = sa.Column(sa.DateTime)  # Audit Information
	eftsubmittedby = sa.Column(sa.String(50))  # Audit Information

	stage = sa.Column(sa.String(50))  # This does not exit in Live
	""" Relationships """

	def __repr__(self):
		return "<Batch {} CreatedBy {}, {} [{}]>".format(
			self.admitname, self.createdby, self.batchtype, self.stage)


class BatchItem(Base):
	__tablename__ = 'TBL_BATCHITEM'
	""" CONSTRAINT PK_BATCHITEM
	PRIMARY KEY (ADMITNAME, RECEIPTNO, SERIALNUMBER, OWNERCODE)
	"""
	admitname = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)
	receiptno = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	dateofpayment = sa.Column(sa.DateTime, index=True)
	dateposted = sa.Column(sa.DateTime, index=True)
	paymenttype = sa.Column(sa.String(50), index=True)  # ! Important
	paymentamount = sa.Column(sa.Float, index=True)  # (mssql:money)
	paymentamountnett = sa.Column(sa.Float, index=True)  # (mssql:money)
	gstamount = sa.Column(sa.Float)  # (mssql:money)
	manualreceiptno = sa.Column(sa.String(50), index=True)  # ! Important
	treatasanon = sa.Column(sa.SmallInteger, index=True)
	tempdestinationcode = sa.Column(sa.String(25))
	tempdestinationcode2 = sa.Column(sa.String(25))
	tempsourcecode = sa.Column(sa.String(25))
	tempsourcecode2 = sa.Column(sa.String(25))
	tempcampaignyear = sa.Column(sa.Integer)
	tempreceiptrequired = sa.Column(sa.String(3))
	tempreceiptsummary = sa.Column(sa.String(3))
	temptaxclaimable = sa.Column(sa.String(3))
	temptranstype = sa.Column(sa.String(20))
	temppledgeplan = sa.Column(sa.String(20))
	temppledgetype = sa.Column(sa.String(20))
	tempfrequency = sa.Column(sa.String(20))
	tempstartdate = sa.Column(sa.DateTime)
	tempinstalments = sa.Column(sa.Float)  # (mssql:real)
	paymentratio = sa.Column(sa.Float)  # (mssql:money)
	narrative = sa.Column(sa.String(255), index=True)
	includeinthankyou = sa.Column(sa.SmallInteger)
	accountname = sa.Column(sa.String(50), index=True)
	sortcode = sa.Column(sa.String(50), index=True)
	accountnumber = sa.Column(sa.String(20), index=True)
	rollnumber = sa.Column(sa.String(20))
	text1 = sa.Column(sa.String(255))
	text2 = sa.Column(sa.String(255))
	bankname = sa.Column(sa.String(100), index=True)
	bankaddress = sa.Column(sa.String(255), index=True)
	bankpostcode = sa.Column(sa.String(10), index=True)
	creditcardtype = sa.Column(sa.String(20), index=True)  # ! Important
	creditcardnumber = sa.Column(sa.String(100), index=True)
	creditcardholder = sa.Column(sa.String(100), index=True)
	creditcardexpiry = sa.Column(sa.String(8), index=True)
	creditcardissuenumber = sa.Column(sa.String(5))
	creditcardauthcode = sa.Column(sa.String(20), index=True)
	creditcardmethod = sa.Column(sa.String(50), index=True)
	chequenumber = sa.Column(sa.String(10), index=True)
	created = sa.Column(sa.DateTime, index=True)  # Audit Information
	createdby = sa.Column(sa.String(50), index=True)  # Audit Information
	modified = sa.Column(sa.DateTime)  # Audit Information
	modifiedby = sa.Column(sa.String(50), index=True)  # Audit Information
	notes = sa.Column(sa.String(8000))
	result = sa.Column(sa.String(255))
	successfailure = sa.Column(sa.SmallInteger)
	applyjointsalutation = sa.Column(sa.SmallInteger)
	title = sa.Column(sa.String(30))
	firstname = sa.Column(sa.String(50))
	keyname = sa.Column(sa.String(100))
	postcode = sa.Column(sa.String(26))
	addressline1 = sa.Column(sa.String(255))
	addressline2 = sa.Column(sa.String(100))
	addressline3 = sa.Column(sa.String(100))
	addressline4 = sa.Column(sa.String(100))
	envelopesalutation = sa.Column(sa.String(100))
	lettersalutation = sa.Column(sa.String(100))
	reversed = sa.Column(sa.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	creditcardtoken = sa.Column(sa.String(50), index=True)
	creditcardmasked = sa.Column(sa.String(100))
	remainingamount = sa.Column(sa.Float, index=True)  # (mssql:money)
	remainingamountnett = sa.Column(sa.Float)  # (mssql:money)
	remaininggstamount = sa.Column(sa.Float)  # (mssql:money)
	orgreceiptno = sa.Column(sa.String(150), index=True)
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	addresstype = sa.Column(sa.String(50))
	daytelephone = sa.Column(sa.String(30))
	eveningtelephone = sa.Column(sa.String(30))
	faxnumber = sa.Column(sa.String(30))
	mobilenumber = sa.Column(sa.String(30))
	emailaddress = sa.Column(sa.String(255))
	dateofbirth = sa.Column(sa.DateTime)
	relationtitle = sa.Column(sa.String(30))
	relationfirstname = sa.Column(sa.String(50))
	relationkeyname = sa.Column(sa.String(100))
	relationship = sa.Column(sa.String(50))
	relationshipreverse = sa.Column(sa.String(50))
	addressid = sa.Column(sa.String(50))
	ic = sa.Column(sa.String(50), index=True)
	ictype = sa.Column(sa.String(255))
	tokengateway = sa.Column(sa.String(50))
	datesettled = sa.Column(sa.DateTime)
	bankreference = sa.Column(sa.String(50))
	dataimportbarcodeid = sa.Column(sa.String(50))
	paymentgatewayresponsecode = sa.Column(sa.String(50))
	""" Relationships """

	def __repr__(self):
		return "<BatchItem {} {} Payment Date: {} [{}]>".format(
			self.admitname, self.serialnumber, self.dateofpayment, self.paymenttype)


class BatchItemPledge(Base):
	__tablename__ = 'TBL_BATCHITEMPLEDGE'
	""" CONSTRAINT PK_BATCHITEMPLEDGE
	PRIMARY KEY (ADMITNAME, RECEIPTNO, SERIALNUMBER, LINEID)
	"""
	admitname = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	receiptno = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	lineid = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	pledgeid = sa.Column(sa.String(150), index=True)  # ! Important Pledge ID
	pledgelineno = sa.Column(sa.Integer, index=True)  # ! Important Installment Number
	paymentamount = sa.Column(sa.Float, index=True)  # (mssql:money) ! Important
	paymentamountnett = sa.Column(sa.Float, index=True)  # (mssql:money) ! Important
	gstamount = sa.Column(sa.Float, index=True)  # (mssql:money) ! Important
	receiptrequired = sa.Column(sa.String(3), index=True)  # Receipting
	receiptletterid = sa.Column(sa.String(25), index=True)  # Receipting
	receiptsummary = sa.Column(sa.String(3), index=True)  # Receipting
	rcptsummaryletterid = sa.Column(sa.String(25), index=True)  # Receipting
	created = sa.Column(sa.DateTime)  # Audit Information
	createdby = sa.Column(sa.String(50))  # Audit Information
	modified = sa.Column(sa.DateTime)  # Audit Information
	modifiedby = sa.Column(sa.String(50))  # Audit Information
	remainingamount = sa.Column(sa.Float, index=True)  # (mssql:money)
	remainingamountnett = sa.Column(sa.Float)  # (mssql:money)
	remaininggstamount = sa.Column(sa.Float)  # (mssql:money)
	""" Relationships """

	def __repr__(self):
		return "<BatchItemPledge {} {} PledgeID {} installment {}>".format(
			self.admitname, self.serialnumber, self.pledgeid, self.pledgelineno)


class BatchItemSplit(Base):
	__tablename__ = 'TBL_BATCHITEMSPLIT'
	""" CONSTRAINT PK_BATCHITEMSPLIT
	PRIMARY KEY (ADMITNAME, RECEIPTNO, SERIALNUMBER, LINEID, SPLITID)
	"""
	admitname = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	receiptno = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	lineid = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	splitid = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)
	externalref = sa.Column(sa.String(50), index=True)
	externalreftype = sa.Column(sa.String(50), index=True)
	taxclaimable = sa.Column(sa.String(4), index=True)  # Yes(Yes)/No(No)/Error(other)
	destinationcode = sa.Column(sa.String(25), index=True)  # ! Important
	destinationcode2 = sa.Column(sa.String(25), index=True)  # ! Important
	sourcecode = sa.Column(sa.String(25), index=True)  # ! Important
	sourcecode2 = sa.Column(sa.String(25), index=True)  # ! Important
	campaignyear = sa.Column(sa.Integer, index=True)
	paymentamount = sa.Column(sa.Float, index=True)  # (mssql:money) ! Important
	paymentamountnett = sa.Column(sa.Float, index=True)  # (mssql:money) ! Important
	gstamount = sa.Column(sa.Float, index=True)  # (mssql:money) ! Important
	new = sa.Column(sa.SmallInteger, index=True)
	existing = sa.Column(sa.SmallInteger, index=True)
	recovered = sa.Column(sa.SmallInteger, index=True)
	rank = sa.Column(sa.Integer, index=True)
	created = sa.Column(sa.DateTime)  # Audit Information
	createdby = sa.Column(sa.String(50))  # Audit Information
	modified = sa.Column(sa.DateTime)  # Audit Information
	modifiedby = sa.Column(sa.String(50))  # Audit Information
	remainingamount = sa.Column(sa.Float, index=True)  # (mssql:money)
	remainingamountnett = sa.Column(sa.Float)  # (mssql:money)
	remaininggstamount = sa.Column(sa.Float, index=True)  # (mssql:money)
	""" Relationships """

	def __repr__(self):
		return "<BatchItemSplit {} {} ${} [{}][{}]>".format(
			self.admitname, self.serialnumber, self.paymentamount, self.sourcecode, self.sourcecode2)


class SourceCode(Base):
	__tablename__ = 'TBL_SOURCECODE'
	""" CONSTRAINT PK_SOURCECODE
	PRIMARY KEY (SOURCECODE, OWNERCODE)
	"""
	sourcecode = sa.Column(sa.String(25), primary_key=True, nullable=False, index=True)  # ! Important
	sourcetype = sa.Column(sa.String(50), index=True)  # ! Important
	sourcedescription = sa.Column(sa.String(255))
	sourcenotes = sa.Column(sa.String(1000))
	sourcestartdate = sa.Column(sa.DateTime)
	sourceenddate = sa.Column(sa.DateTime, index=True)
	recordowner = sa.Column(sa.String(50), index=True)
	created = sa.Column(sa.DateTime)  # Audit Information
	createdby = sa.Column(sa.String(50))  # Audit Information
	modified = sa.Column(sa.DateTime)  # Audit Information
	modifiedby = sa.Column(sa.String(50))  # Audit Information
	excludefromdropdown = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	sourcetarget = sa.Column(sa.Float, index=True)  # (mssql:money)
	sourcebudget = sa.Column(sa.Float, index=True)  # (mssql:money)
	destinationcode = sa.Column(sa.String(25), index=True)
	destinationcode2 = sa.Column(sa.String(25), index=True)
	taxdeductible = sa.Column(sa.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	goodstaxapplicable = sa.Column(sa.SmallInteger, default=0, index=True)
	excludefromstatistics = sa.Column(sa.SmallInteger, index=True)
	additionalcode1 = sa.Column(sa.String(50), index=True)  # ! Important QB Account
	additionalcode2 = sa.Column(sa.String(50), index=True)
	additionalcode3 = sa.Column(sa.String(50), index=True)  # ! Important TQ Campaign
	additionalcode4 = sa.Column(sa.String(50), index=True)
	additionalcode5 = sa.Column(sa.String(50), index=True)  # ! Important QB Class
	availontimesheet = sa.Column(sa.SmallInteger, index=True)
	separatereceipts = sa.Column(sa.String(50), index=True)
	lotteryflag = sa.Column(sa.SmallInteger, index=True)
	sourcecode2 = sa.Column(sa.String(50), index=True)
	accountname = sa.Column(sa.String(50))
	sortcode = sa.Column(sa.String(50))
	accountnumber = sa.Column(sa.String(20))
	bankname = sa.Column(sa.String(100))
	bankaddress = sa.Column(sa.String(255))
	bankpostcode = sa.Column(sa.String(10))
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	edhevent = sa.Column(sa.String(255), index=True)
	inputtaxed = sa.Column(sa.SmallInteger, index=True)
	category = sa.Column(sa.String(50))  # ! Important
	netreporting = sa.Column(sa.SmallInteger)
	auditnote = sa.Column(sa.Text, default='')  # (mssql:varchar(max))
	""" Relationships """

	def __repr__(self):
		return "<SS1 {}, QB {}.{}, {}".format(
			self.sourcecode, self.additionalcode1, self.additionalcode5, self.additionalcode3)


class Sourcecode2(Base):
	__tablename__ = 'TBL_SOURCECODE2'
	""" CONSTRAINT PK_SOURCECODE2
	PRIMARY KEY (SOURCECODE2, OWNERCODE)
	"""
	sourcecode2 = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = sa.Column(sa.String(50), index=True)
	category = sa.Column(sa.String(50), index=True)  # ! Important
	type = sa.Column(sa.String(50), index=True)  # ! Important
	description = sa.Column(sa.String(255), index=True)
	notes = sa.Column(sa.String(2500))
	excludefromdropdown = sa.Column(sa.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = sa.Column(sa.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	created = sa.Column(sa.DateTime, index=True)  # Audit Information
	createdby = sa.Column(sa.String(50), index=True)  # Audit Information
	modified = sa.Column(sa.DateTime, index=True)  # Audit Information
	modifiedby = sa.Column(sa.String(50), index=True)  # Audit Information
	prefix = sa.Column(sa.String(50), index=True)
	lowermanualreceiptno = sa.Column(sa.Integer, index=True)
	uppermanualreceiptno = sa.Column(sa.Integer, index=True)
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	target = sa.Column(sa.Float)  # (mssql:money)
	""" Relationships """

	def __repr__(self):
		return "<SS2 {}".format(self.sourcecode2)


class DestinationCode(Base):
	__tablename__ = 'TBL_DESTINATIONCODE'
	""" CONSTRAINT PK_DESTINATIONCODE
	PRIMARY KEY (DESTINATIONCODE, OWNERCODE)
	"""
	destinationcode = sa.Column(sa.String(25), primary_key=True, nullable=False, index=True)  # ! Important
	destinationtype = sa.Column(sa.String(50), index=True)  # ! Important
	destinationdescription = sa.Column(sa.String(255), index=True)  # ! Important
	destinationnotes = sa.Column(sa.String(1000))  # ! Important
	ledgercode = sa.Column(sa.String(50), index=True)  # ! Important
	recordowner = sa.Column(sa.String(25), index=True)
	modified = sa.Column(sa.DateTime)  # Audit Information
	modifiedby = sa.Column(sa.String(50))  # Audit Information
	created = sa.Column(sa.DateTime)  # Audit Information
	createdby = sa.Column(sa.String(50))  # Audit Information
	excludefromdropdown = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = sa.Column(sa.Float, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	availontimesheet = sa.Column(sa.SmallInteger, index=True)
	additionalcode1 = sa.Column(sa.String(255), index=True)
	additionalcode2 = sa.Column(sa.String(50), index=True)
	additionalcode3 = sa.Column(sa.String(255), index=True)
	additionalcode4 = sa.Column(sa.String(50), index=True)
	additionalcode5 = sa.Column(sa.String(50), index=True)
	receiptsplitorder = sa.Column(sa.Integer, index=True)
	reportfinancesystemdetail = sa.Column(sa.SmallInteger, index=True)
	accountname = sa.Column(sa.String(50))
	sortcode = sa.Column(sa.String(50))
	accountnumber = sa.Column(sa.String(20))
	bankname = sa.Column(sa.String(100))
	bankaddress = sa.Column(sa.String(255))
	bankpostcode = sa.Column(sa.String(10))
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	gatewayname = sa.Column(sa.String(50))
	nonallocable = sa.Column(sa.SmallInteger, index=True)
	""" Relationships """

	def __repr__(self):
		return "<DS1 {}".format(self.destinationcode)


class DestinationCode2(Base):
	__tablename__ = 'TBL_DESTINATIONCODE2'
	""" CONSTRAINT PK_DESTINATIONCODE2
	PRIMARY KEY (DESTINATIONCODE2, OWNERCODE)
	"""
	destinationcode2 = sa.Column(sa.String(25), primary_key=True, nullable=False, index=True)  # ! Important
	destinationtype = sa.Column(sa.String(50), index=True)  # ! Important
	destinationdescription = sa.Column(sa.String(255), index=True)  # ! Important
	destinationnotes = sa.Column(sa.String(1000))  # ! Important
	ledgercode = sa.Column(sa.String(50), index=True)  # ! Important
	recordowner = sa.Column(sa.String(25), index=True)
	modified = sa.Column(sa.DateTime, index=True)  # Audit Information
	modifiedby = sa.Column(sa.String(50), index=True)  # Audit Information
	created = sa.Column(sa.DateTime, index=True)  # Audit Information
	createdby = sa.Column(sa.String(50), index=True)  # Audit Information
	excludefromdropdown = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = sa.Column(sa.Float, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	""" Relationships """

	def __repr__(self):
		return "<DS2 {}".format(self.destinationcode2)


class Contact(Base):
	__tablename__ = 'TBL_CONTACT'
	""" CONSTRAINT PK_CONTACT
	PRIMARY KEY (SERIALNUMBER, OWNERCODE)
	"""
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	contacttype = sa.Column(sa.String(15), index=True)  # ! Important
	title = sa.Column(sa.String(30), index=True)  # ! Important
	firstname = sa.Column(sa.String(50), index=True)  # ! Important
	otherinitial = sa.Column(sa.String(50), index=True)  # ! Important
	keyname = sa.Column(sa.String(100), index=True)  # ! Important
	postnominal = sa.Column(sa.String(20))
	envelopesalutation = sa.Column(sa.String(100))
	lettersalutation = sa.Column(sa.String(100))
	contactposition = sa.Column(sa.String(200))
	careof = sa.Column(sa.String(100), index=True)
	addresstype = sa.Column(sa.String(50))
	country = sa.Column(sa.String(50))  # ! Important
	postcode = sa.Column(sa.String(10), index=True)  # ! Important
	addressline1 = sa.Column(sa.String(255), index=True)
	addressline2 = sa.Column(sa.String(100))
	addressline3 = sa.Column(sa.String(100), index=True)  # ! Important Suburb
	addressline4 = sa.Column(sa.String(100), index=True)  # ! Important State
	addressline5 = sa.Column(sa.String(100))
	addressline6 = sa.Column(sa.String(100))
	addresscode1 = sa.Column(sa.String(50))
	addresscode2 = sa.Column(sa.String(50))
	addresscode3 = sa.Column(sa.String(50))
	salesregion = sa.Column(sa.String(50), index=True)
	daytelephone = sa.Column(sa.String(30))
	eveningtelephone = sa.Column(sa.String(30))
	faxnumber = sa.Column(sa.String(30))
	mobilenumber = sa.Column(sa.String(30), index=True)
	emailaddress = sa.Column(sa.String(255), index=True)  # ! Important
	website = sa.Column(sa.String(150))
	charitynumber = sa.Column(sa.Float)
	primarycategory = sa.Column(sa.String(50), index=True)  # ! Important
	occupation = sa.Column(sa.String(50))
	dateofbirth = sa.Column(sa.DateTime)
	gender = sa.Column(sa.String(10))
	previousnames = sa.Column(sa.String(255))
	maritalstatus = sa.Column(sa.String(25))
	taxstatus = sa.Column(sa.String(25))
	preferredmethod = sa.Column(sa.String(10), index=True)
	donotmail = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	donotmailreason = sa.Column(sa.String(50), index=True)  # ! Important
	donotmailfrom = sa.Column(sa.DateTime, index=True)  # ! Important
	donotmailuntil = sa.Column(sa.DateTime, index=True)  # ! Important
	source = sa.Column(sa.String(50))  # ! Important
	recordowner = sa.Column(sa.String(50))
	picturefile = sa.Column(sa.String(50))
	created = sa.Column(sa.DateTime)  # (mssql:datetime2) Audit Information
	createdby = sa.Column(sa.String(50))  # Audit Information
	modified = sa.Column(sa.DateTime)  # (mssql:datetime2) Audit Information
	modifiedby = sa.Column(sa.String(50))  # Audit Information
	defaultaddress = sa.Column(sa.String(50), index=True)
	useaddressfrom = sa.Column(sa.DateTime, index=True)
	useaddressuntil = sa.Column(sa.DateTime, index=True)
	gadstatus = sa.Column(sa.String(25))
	vip = sa.Column(sa.SmallInteger, index=True)
	maincontact = sa.Column(sa.String(50), index=True)
	abn = sa.Column(sa.String(100), index=True)
	majordonor = sa.Column(sa.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	bequestprospect = sa.Column(sa.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	sortkey = sa.Column(sa.String(255), index=True)
	sortkeyref1 = sa.Column(sa.String(50))
	sortkeyrefrel1 = sa.Column(sa.String(50))
	sortkeyrefrel2 = sa.Column(sa.String(50))
	anonymous = sa.Column(sa.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	recordviewto = sa.Column(sa.String(50), index=True)
	lga = sa.Column(sa.String(50))
	sedupper = sa.Column(sa.String(50))
	sedlower = sa.Column(sa.String(50))
	emailok = sa.Column(sa.String(10), index=True)
	emailerror = sa.Column(sa.String(255))
	ccemailok = sa.Column(sa.String(10), index=True)
	ccemailerror = sa.Column(sa.String(255))
	bequestnote = sa.Column(sa.String(8000))
	webusername = sa.Column(sa.String(50), index=True)
	webpassword = sa.Column(sa.String(255))
	webpublish = sa.Column(sa.SmallInteger, index=True)
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	coaflag = sa.Column(sa.Integer)
	coadate = sa.Column(sa.DateTime)
	skypename = sa.Column(sa.String(50))
	twitterhandle = sa.Column(sa.String(50))  # Social Media
	facebookurl = sa.Column(sa.String(255))  # Social Media
	linkedinurl = sa.Column(sa.String(255))  # Social Media
	""" Relationships """

	def __repr__(self):
		return "<Contact {}".format(self.serialnumber)


class ContactAttribute(Base):
	__tablename__ = 'TBL_CONTACTATTRIBUTE'
	""" CONSTRAINT PK_CONTACTATTRIBUTE
	PRIMARY KEY (SERIALNUMBER)
	"""
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)
	htmlnotes = sa.Column(sa.Text)  # (mssql:varchar(max))
	countamount = sa.Column(sa.Float, index=True)
	sumamount = sa.Column(sa.Float, index=True)
	maxamount = sa.Column(sa.Float, index=True)
	avgamount = sa.Column(sa.Float)
	maxdate = sa.Column(sa.DateTime, index=True)
	mindate = sa.Column(sa.DateTime, index=True)
	leadcontact = sa.Column(sa.SmallInteger, default=0)
	jointsalutation = sa.Column(sa.String(255), index=True)
	jointlettersalutation = sa.Column(sa.String(255), index=True)
	defaulttitle = sa.Column(sa.String(30))
	defaultfirstname = sa.Column(sa.String(50), index=True)
	defaultkeyname = sa.Column(sa.String(100), index=True)
	defaultaddressline1 = sa.Column(sa.String(255), index=True)
	defaultaddressline2 = sa.Column(sa.String(100))
	defaultaddressline3 = sa.Column(sa.String(100), index=True)
	defaultaddressline4 = sa.Column(sa.String(100), index=True)
	defaultpostcode = sa.Column(sa.String(10), index=True)
	defaultcountry = sa.Column(sa.String(50))
	defaultaddresscode1 = sa.Column(sa.String(50))
	defaultaddresscode2 = sa.Column(sa.String(50))
	externalref = sa.Column(sa.String(50), index=True)
	externalreftype = sa.Column(sa.String(50), index=True)
	externalrefdate = sa.Column(sa.DateTime, index=True)
	subaddress = sa.Column(sa.String(100))
	plaintextemail = sa.Column(sa.SmallInteger, default=0, index=True)
	picturefile2 = sa.Column(sa.String(50))
	donotcall = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	secondcontact = sa.Column(sa.String(50), index=True)
	canvassee = sa.Column(sa.SmallInteger, default=0, index=True)
	donotpublish = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	volunteer = sa.Column(sa.SmallInteger, default=0, index=True)
	volsource = sa.Column(sa.String(30), index=True)
	volspecialreq = sa.Column(sa.String(255))
	emergencyname = sa.Column(sa.String(200))
	emergencynumber = sa.Column(sa.String(30))
	volunteermanager = sa.Column(sa.String(200))
	donotvolunteer = sa.Column(sa.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	crmprimarymanager = sa.Column(sa.String(50), default=0, index=True)  # CRM Information
	crmsecondarymanager = sa.Column(sa.String(50))  # CRM Information
	crmplan = sa.Column(sa.String(20))  # CRM Information
	crmrefermanager = sa.Column(sa.SmallInteger, index=True)  # CRM Information
	crmnote = sa.Column(sa.String(1500))
	ccemailaddress = sa.Column(sa.String(255))
	ccname = sa.Column(sa.String(255))
	source2 = sa.Column(sa.String(50))
	defaultsource2 = sa.Column(sa.String(50))
	medicalref1 = sa.Column(sa.String(50))
	medicalref2 = sa.Column(sa.String(50))
	medicalref2date = sa.Column(sa.DateTime)
	defaultreceiptrequired = sa.Column(sa.String(3), index=True)
	defaultreceiptsummary = sa.Column(sa.String(3), index=True)
	sourcedate = sa.Column(sa.DateTime)
	tempmaintitle = sa.Column(sa.String(30))
	tempmainfirstname = sa.Column(sa.String(50))
	tempmainkeyname = sa.Column(sa.String(100))
	tempsecondarytitle = sa.Column(sa.String(30))
	tempsecondaryfirstname = sa.Column(sa.String(50))
	tempsecondarykeyname = sa.Column(sa.String(100))
	defaultproductlevel = sa.Column(sa.String(255))
	nickname = sa.Column(sa.String(255), index=True)
	configtext1 = sa.Column(sa.String(255))
	configtext2 = sa.Column(sa.String(255))
	configtext3 = sa.Column(sa.String(255))
	configtext4 = sa.Column(sa.String(255))
	configtext5 = sa.Column(sa.String(255))
	ic = sa.Column(sa.String(50), index=True)
	ictype = sa.Column(sa.String(255))
	alttitle = sa.Column(sa.String(500))
	altfirstname = sa.Column(sa.String(500))
	altkeyname = sa.Column(sa.String(500))
	altaddress = sa.Column(sa.String(4000))
	donotemail = sa.Column(sa.SmallInteger, default=0)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	sumamountsoft = sa.Column(sa.Float)
	countamountsoft = sa.Column(sa.Integer)
	sumamounthardnsoft = sa.Column(sa.Float)
	countamounthardnsoft = sa.Column(sa.Integer)
	referralsource = sa.Column(sa.String(50))
	qldhealthregion = sa.Column(sa.String(50))
	qldregion = sa.Column(sa.String(100))
	islander = sa.Column(sa.SmallInteger)
	writtenprivacyconsentheld = sa.Column(sa.SmallInteger)
	verbalprivacyconsentgiven = sa.Column(sa.SmallInteger)
	notes = sa.Column(sa.Text)  # (mssql:varchar(max))
	""" Relationships """

	def __repr__(self):
		return "<ContactAttribute {}".format(self.serialnumber)


class ContactParameter(Base):
	__tablename__ = 'TBL_CONTACTPARAMETER'
	""" CONSTRAINT PK_CONTACTPARAMETER
	PRIMARY KEY (SERIALNUMBER, PARAMETERNAME, PARAMETERVALUE, ADDITIONAL1, ADDITIONAL2, ADDITIONAL3, OWNERCODE)
	"""
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	parametername = sa.Column(sa.String(100), primary_key=True, nullable=False, index=True)  # ! Important
	parametervalue = sa.Column(sa.String(200), primary_key=True, nullable=False, index=True)  # ! Important
	effectivefrom = sa.Column(sa.DateTime, index=True)  # ! Important
	effectiveto = sa.Column(sa.DateTime, index=True)  # ! Important
	parameternote = sa.Column(sa.String(2000))
	additional1 = sa.Column(sa.String(100), primary_key=True, nullable=False, default='', index=True)
	additional2 = sa.Column(sa.String(100), primary_key=True, nullable=False, default='', index=True)
	additional3 = sa.Column(sa.String(100), primary_key=True, nullable=False, default='', index=True)
	additional4 = sa.Column(sa.String(100))
	additional5 = sa.Column(sa.String(1000))
	priority = sa.Column(sa.String(50), index=True)
	created = sa.Column(sa.DateTime, index=True)  # Audit Information
	createdby = sa.Column(sa.String(50), index=True)  # Audit Information
	modified = sa.Column(sa.DateTime, index=True)  # Audit Information
	modifiedby = sa.Column(sa.String(50), index=True)  # Audit Information
	recordowner = sa.Column(sa.String(50), index=True)
	id = sa.Column(sa.Integer, index=True)  # (mssql:INT IDENTITY)
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	""" Relationships """

	def __repr__(self):
		return "<ContactParameter {}, {}/{}>".format(
			self.serialnumber, self.parametername, self.parametervalue)


class Communication(Base):
	__tablename__ = 'TBL_COMMUNICATION'
	""" CONSTRAINT PK_COMMUNICATION
	PRIMARY KEY (COMMUNICATIONREF, SERIALNUMBER, OWNERCODE)
	"""
	communicationref = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	communicationtype = sa.Column(sa.String(50), index=True)  # ! Important
	externalref = sa.Column(sa.String(50), index=True)  # External Reference
	externalreftype = sa.Column(sa.String(50), index=True)  # External Reference
	crmflag = sa.Column(sa.String(3), index=True)  # Flag : Yes(Yes)/No(No)/Error(other)
	dateofcommunication = sa.Column(sa.DateTime, index=True)  # ! Important
	subject = sa.Column(sa.String(255), index=True)  # ! Important
	notes = sa.Column(sa.Text, index=True)  # (mssql:varchar(max)) ! Important  #
	created = sa.Column(sa.DateTime, index=True)  # Audit Information
	createdby = sa.Column(sa.String(50), index=True)  # Audit Information
	modified = sa.Column(sa.DateTime, index=True)  # Audit Information
	modifiedby = sa.Column(sa.String(50), index=True)  # Audit Information
	priority = sa.Column(sa.String(50), index=True)
	attachmenticon = sa.Column(sa.Integer)
	recordowner = sa.Column(sa.String(50), index=True)
	accessrights = sa.Column(sa.String(255), index=True)
	confidential = sa.Column(sa.SmallInteger, index=True)
	response = sa.Column(sa.String(50), index=True)
	category = sa.Column(sa.String(50), index=True)  # ! Important
	timeofcommunication = sa.Column(sa.String(10), index=True)  # ! Important
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, default=0, index=True)
	sticky = sa.Column(sa.Integer, index=True)  # (mssql:bit), Yes(-1)/No(0, Null)/Error(other)
	reply = sa.Column(sa.String(1000))
	replydatetime = sa.Column(sa.DateTime)
	""" Relationships """

	def __repr__(self):
		return "<Communication {},{} CreatedBy {}, Type{} Category{}>".format(
			self.communicationref, self.serialnumber, self.createdby, self.communicationtype, self.category)


class PledgeHeader(Base):
	__tablename__ = 'TBL_PLEDGEHEADER'
	""" CONSTRAINT PK_PLEDGEHEADER
	PRIMARY KEY (PLEDGEID, OWNERCODE)
	"""
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)
	# !! Key Information
	pledgestatus = sa.Column(sa.String(25), index=True)
	serialnumber = sa.Column(sa.String(50), nullable=False, index=True)
	description = sa.Column(sa.String(255), index=True)
	pledgeplan = sa.Column(sa.String(50), index=True)
	pledgetype = sa.Column(sa.String(25), index=True)
	currency = sa.Column(sa.String(25))
	# Source Codes : Not working properly
	sourcecode = sa.Column(sa.String(25))
	sourcecode2 = sa.Column(sa.String(25))
	# Campaign Year : Not using properly
	campaignyear = sa.Column(sa.Integer)
	# !! Key Information
	paymenttype = sa.Column(sa.String(25), index=True)
	# Receipt
	receiptrequired = sa.Column(sa.String(4), index=True)
	receiptsummary = sa.Column(sa.String(4), index=True)
	receiptfrequency = sa.Column(sa.String(25))
	nextreceiptdate = sa.Column(sa.DateTime)
	# !! Key Information
	startdate = sa.Column(sa.DateTime, index=True)
	enddate = sa.Column(sa.DateTime)
	# Payments
	totalvalue = sa.Column(sa.Float, index=True)  # mssql: money
	instalmentvalue = sa.Column(sa.Float)  # mssql: money
	paymentfrequency = sa.Column(sa.String(25))
	maxpayments = sa.Column(sa.Integer)
	accountname = sa.Column(sa.String(50))
	sortcode = sa.Column(sa.String(10), index=True)
	accountnumber = sa.Column(sa.String(20))
	rollnumber = sa.Column(sa.String(20))
	text1 = sa.Column(sa.String(255))
	text2 = sa.Column(sa.String(255))
	# Bank info
	bankname = sa.Column(sa.String(100))
	bankaddress = sa.Column(sa.String(255))
	bankpostcode = sa.Column(sa.String(10))
	# CC info
	creditcardtype = sa.Column(sa.String(20), index=True)
	creditcardnumber = sa.Column(sa.String(100))
	creditcardholder = sa.Column(sa.String(100), index=True)
	creditcardexpiry = sa.Column(sa.String(8))
	creditcardissuenumber = sa.Column(sa.String(5))
	creditcardmethod = sa.Column(sa.String(50))

	pledgerecruitedby = sa.Column(sa.String(255))
	pledgerecruitedbyevent = sa.Column(sa.String(25))
	recordowner = sa.Column(sa.String(25))

	created = sa.Column(sa.DateTime)  # Audit Information
	createdby = sa.Column(sa.String(50))  # Audit Information
	modified = sa.Column(sa.DateTime)  # Audit Information
	modifiedby = sa.Column(sa.String(50))  # Audit Information

	taxclaimable = sa.Column(sa.String(4))  # Yes/No/(other)
	# External Reference
	externalref = sa.Column(sa.String(25), index=True)
	externalreftype = sa.Column(sa.String(25), index=True)

	escalationletter = sa.Column(sa.SmallInteger)
	lastescalationdate = sa.Column(sa.DateTime)

	membership = sa.Column(sa.SmallInteger)
	membershipid = sa.Column(sa.String(50))
	subscription = sa.Column(sa.SmallInteger)
	subscriptionid = sa.Column(sa.String(50))
	# Ignore
	new = sa.Column(sa.SmallInteger)
	existing = sa.Column(sa.SmallInteger, index=True)
	recovered = sa.Column(sa.SmallInteger, index=True)
	# Acknowledge
	acknowledge = sa.Column(sa.String(4))  # Yes/No/(other)
	acknowledgedate = sa.Column(sa.DateTime)
	acknowledgeletter = sa.Column(sa.String(50))

	totalpaid = sa.Column(sa.Float, index=True)  # mssql: money
	outstanding = sa.Column(sa.Float, index=True)  # mssql: money
	originaltotalvalue = sa.Column(sa.Float)  # mssql: money
	oneoff = sa.Column(sa.String(4))
	# Serial Number Info
	title = sa.Column(sa.String(30))
	firstname = sa.Column(sa.String(50), index=True)
	keyname = sa.Column(sa.String(100), index=True)
	# WrittenDown
	writtendownreason = sa.Column(sa.String(100), index=True)
	writtendown = sa.Column(sa.DateTime, index=True)
	writtendownby = sa.Column(sa.String(50), index=True)
	# OnHold
	onholdreason = sa.Column(sa.String(100), index=True)
	onholddatetime = sa.Column(sa.DateTime, index=True)
	onholdby = sa.Column(sa.String(50), index=True)

	reminder = sa.Column(sa.String(3), index=True)  # Yes/No/(other)

	creditcardtoken = sa.Column(sa.String(50))
	creditcardmasked = sa.Column(sa.String(100))
	ownercode = sa.Column(sa.Integer, primary_key=True, nullable=False, index=True)
	tokengateway = sa.Column(sa.String(50))

	onreactivationlist = sa.Column(sa.String(50))
	reactivationfollowup = sa.Column(sa.DateTime)

	pledgerecruitedbydate = sa.Column(sa.DateTime)
	recruiterid = sa.Column(sa.String(20))
	fundraiserid = sa.Column(sa.String(20))
	recruitmentagencyid = sa.Column(sa.String(20))
	recruitmentmethod = sa.Column(sa.String(50))
	recruitmentlocation = sa.Column(sa.String(100))

	nextcalldate = sa.Column(sa.DateTime)
	calloutcome = sa.Column(sa.String(50))
	calldetail = sa.Column(sa.String(2000))
	currentyearvalue = sa.Column(sa.Float)  # mssql: money
	""" Relationships """

	def __repr__(self):
		return "<Pledge {},{} CreatedBy {}, Recruited {}>".format(
			self.pledgeid, self.serialnumber, self.createdby, self.pledgerecruitedby)


class PledgeHeaderAttribute(Base):
	__tablename__ = 'TBL_PLEDGEHEADERATTRIBUTE'
	""" CONSTRAINT PK_PLEDGEHEADERATTRIBUTE
	PRIMARY KEY (PLEDGEID)
	"""
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)
	# Redundant
	destinationcode = sa.Column(sa.String(50), index=True)
	destinationcode2 = sa.Column(sa.String(50), index=True)
	paymentratio = sa.Column(sa.Float, index=True)  # mssql: money
	# !! Key Information
	notes = sa.Column(sa.Text)  # mssql: varchar(max)
	auditnotes = sa.Column(sa.String(8000))
	# CC Info
	creditcardmasked = sa.Column(sa.String(100))
	""" Relationships """

	def __repr__(self):
		return "<Pledge Attributes {} >".format(self.pledgeid)


class PledgeHeaderRelationship(Base):
	__tablename__ = 'TBL_PLEDGEHEADERRELATIONSHIP'
	# Primary Key
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False)
	serialnumber = sa.Column(sa.String(50), primary_key=True, nullable=False)
	# Designation : PRIMARY / SOFT
	designation = sa.Column(sa.String(10), index=True)
	""" Relationships """

	def __repr__(self):
		return "<Pledge {},{} ({})>".format(
			self.pledgeid, self.serialnumber, self.designation)


class PledgeDestination(Base):
	__tablename__ = 'TBL_PLEDGEDESTINATION'
	# Primary Key
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)
	autoid = sa.Column(sa.Numeric(18), primary_key=True, nullable=False, index=True)
	# Source Codes
	sourcecode = sa.Column(sa.String(50), index=True)
	sourcecode2 = sa.Column(sa.String(50), index=True)
	# Destination Codes
	destinationcode = sa.Column(sa.String(50), index=True)
	destinationcode2 = sa.Column(sa.String(50), index=True)
	# Other
	campaignyear = sa.Column(sa.Integer, index=True)
	paymentratio = sa.Column(sa.Float, index=True)  # mssql: money
	""" Relationships """

	def __repr__(self):
		return "<Pledge S/D {} ({}/{}) ({}/{})>".format(
			self.pledgeid, self.sourcecode, self.sourcecode2, self.destinationcode, self.destinationcode2)


class PledgeInstalmentsActive(Base):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_ACTIVE'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_ACTIVE
	PRIMARY KEY (PLEDGEID, INSTALMENTID)
	"""
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	instalmentid = sa.Column(sa.Float, primary_key=True, nullable=False, index=True)  # ! Important
	instalment = sa.Column(sa.Float, index=True)  # mssql: money  ! Important
	datedue = sa.Column(sa.DateTime, index=True)  # ! Important
	amountpaid = sa.Column(sa.Float, index=True)  # mssql: money  ! Important
	onhold = sa.Column(sa.SmallInteger, index=True)  # Yes(-1)/No(0, Null)/Error(other)
	campaignyear = sa.Column(sa.Integer, index=True)
	comments = sa.Column(sa.String(3000))
	invoicenth = sa.Column(sa.Numeric(18), index=True)
	""" Relationships """

	def __repr__(self):
		return "<PledgeA {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)


class PledgeInstalmentsClosed(Base):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_CLOSED'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_CLOSED
	PRIMARY KEY (PLEDGEID, INSTALMENTID)
	"""
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	instalmentid = sa.Column(sa.Float, primary_key=True, nullable=False, index=True)  # ! Important
	instalment = sa.Column(sa.Float, index=True)  # mssql: money  ! Important
	datedue = sa.Column(sa.DateTime, index=True)
	amountpaid = sa.Column(sa.Float, index=True)  # mssql: money  ! Important
	campaignyear = sa.Column(sa.Integer, index=True)
	comments = sa.Column(sa.String(3000))
	invoicenth = sa.Column(sa.Numeric(18), index=True)
	""" Relationships """

	def __repr__(self):
		return "<PledgeC {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)


class PledgeInstalmentsWrittenOff(Base):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_WRITTENOFF'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_WRITTENOFF
	PRIMARY KEY (PLEDGEID, INSTALMENTID)
	"""
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	instalmentid = sa.Column(sa.Float, primary_key=True, nullable=False, index=True)  # ! Important
	instalment = sa.Column(sa.Float, index=True)  # mssql: money ! Important
	datedue = sa.Column(sa.DateTime, index=True)  # ! Important
	amountpaid = sa.Column(sa.Float, index=True)  # mssql: money
	originalinstalment = sa.Column(sa.Float, index=True)  # mssql: money
	campaignyear = sa.Column(sa.Integer, index=True)
	comments = sa.Column(sa.String(3000))
	invoicenth = sa.Column(sa.Numeric(18), index=True)
	writtendown = sa.Column(sa.DateTime)  # ! Important
	writtendownby = sa.Column(sa.String(50))  # ! Important
	writtendownreason = sa.Column(sa.String(100))  # ! Important
	""" Relationships """

	def __repr__(self):
		return "<PledgeR {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)


class PledgeInstalmentsFailure(Base):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_FAILURE'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_FAILURE
	PRIMARY KEY (ID)
	"""
	id = sa.Column(sa.Integer, primary_key=True, nullable=False, index=True)  # ! Important
	pledgeid = sa.Column(sa.String(150), index=True)  # ! Important
	instalmentid = sa.Column(sa.Float)  # ! Important
	batchid = sa.Column(sa.String(50))  # ! Important Batch Item Info
	receiptno = sa.Column(sa.String(150))  # ! Important Batch Item Info
	dateofpayment = sa.Column(sa.DateTime)  # ! Important Batch Item Info
	result = sa.Column(sa.String(255))  # ! Important
	created = sa.Column(sa.DateTime)  # Audit Information
	createdby = sa.Column(sa.String(50))  # Audit Information
	modified = sa.Column(sa.DateTime)  # Audit Information
	modifiedby = sa.Column(sa.String(50))  # Audit Information
	automationflag = sa.Column(sa.Integer)
	""" Relationships """

	def __repr__(self):
		return "<PledgeF {} Ins {} FailureID {}>".format(
			self.pledgeid, self.instalmentid, self.id)


class PledgeInstalmentsNextActive(Base):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_NEXTACTIVE'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_NEXTACTIVE
	PRIMARY KEY (PLEDGEID)
	"""
	pledgeid = sa.Column(sa.String(150), primary_key=True, nullable=False, index=True)
	instalmentid = sa.Column(sa.Float, index=True)   # ! Important
	instalment = sa.Column(sa.Float, index=True)  # mssql: money  ! Important
	datedue = sa.Column(sa.DateTime, index=True)  # ! Important
	amountpaid = sa.Column(sa.Float, index=True)  # mssql: money
	""" Relationships """

	def __repr__(self):
		return "<PledgeN {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)
