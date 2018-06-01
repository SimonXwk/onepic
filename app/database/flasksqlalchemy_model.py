from app.extensions import db


class Object(db.Model):
	__tablename__ = 'TBL_OBJECT'
	""" CONSTRAINT PK_OBJECT
	PRIMARY KEY (ADMITNAME)
	"""
	admitname = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	stageid = db.Column(db.Float, index=True)  # ! Important
	owner = db.Column(db.String(50))
	admittype = db.Column(db.String(20), index=True)  # ! Important, BATCHHEADER/DATAIMPORT/MAILINGHEADER/ORDERHEADER
	filename = db.Column(db.String(50))
	filepath = db.Column(db.String(255))
	title = db.Column(db.String(80))
	subject = db.Column(db.String(50))
	author = db.Column(db.String(50))
	keywords = db.Column(db.String(50))
	comments = db.Column(db.String(255))
	created = db.Column(db.DateTime)  # Audit Information
	removed = db.Column(db.DateTime, index=True)  # Audit Information
	modified = db.Column(db.DateTime, index=True)  # Audit Information
	""" Relationships """

	def __repr__(self):
		return "<Object {} Type {} stage id {}>".format(
			self.admitname, self.admittype, self.stageid)


class Stage(db.Model):
	__tablename__ = 'TBL_STAGE'
	""" CONSTRAINT PK_STAGE
	PRIMARY KEY (STAGEID)
	"""
	stageid = db.Column(db.Float, primary_key=True, nullable=False, index=True)
	stage = db.Column(db.String(50), index=True)
	stagealias = db.Column(db.String(50))
	description = db.Column(db.String(50))
	history = db.Column(db.SmallInteger, nullable=False, default=0)  # (mssql:bit) Yes(-1)/No(0, Null)/Error(other)
	""" Relationships """

	def __repr__(self):
		return "<Stage {} {} history {}>".format(
			self.stageid, self.stage, self.history)


class BatchHeader(db.Model):
	__tablename__ = 'TBL_BATCHHEADER'
	""" CONSTRAINT PK_BATCHHEADER
	PRIMARY KEY (ADMITNAME, OWNERCODE)
	"""
	admitname = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	batchtype = db.Column(db.String(50), index=True)  # ! Important
	batchdescription = db.Column(db.String(255), index=True)  # ! Important
	currency = db.Column(db.String(25))
	expectednumberofitems = db.Column(db.Float)
	expectedvalue = db.Column(db.Float)  # (mssql:money)
	accountreference = db.Column(db.String(25), index=True)  # ! Important
	payinginreference = db.Column(db.String(25))  # ! Important
	senttoaccounts = db.Column(db.SmallInteger)
	receiptsprepared = db.Column(db.SmallInteger)
	defaultdateofpayment = db.Column(db.DateTime)
	defaultpaymenttype = db.Column(db.String(25))
	defaultpaymentamount = db.Column(db.Float)  # (mssql:money)
	defaulttaxclaimable = db.Column(db.String(4))
	defaultreceiptrequired = db.Column(db.String(4))
	defaultdestination = db.Column(db.String(25))
	defaultdestination2 = db.Column(db.String(25))
	defaultsource = db.Column(db.String(25), index=True)
	defaultsource2 = db.Column(db.String(25))
	defaultcampaignyear = db.Column(db.Integer)
	defaultincludetextrule = db.Column(db.String(50))
	approved = db.Column(db.DateTime, index=True)  # Audit Information
	approvedby = db.Column(db.String(50), index=True)  # Audit Information
	created = db.Column(db.DateTime, index=True)  # Audit Information
	createdby = db.Column(db.String(50), index=True)  # Audit Information
	modified = db.Column(db.DateTime, index=True)  # Audit Information
	modifiedby = db.Column(db.String(50), index=True)  # Audit Information
	currentlyeditedby = db.Column(db.String(50))
	defaultreceiptsummary = db.Column(db.String(3), index=True)
	submitted = db.Column(db.DateTime, index=True)  # Audit Information
	submittedby = db.Column(db.String(50), index=True)  # Audit Information
	fundstatscalculated = db.Column(db.SmallInteger, index=True)
	notes = db.Column(db.String(8000))
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	eftsubmitted = db.Column(db.DateTime)  # Audit Information
	eftsubmittedby = db.Column(db.String(50))  # Audit Information

	stage = db.Column(db.String(50))  # This does not exit in Live
	""" Relationships """

	def __repr__(self):
		return "<Batch {} CreatedBy {}, {} [{}]>".format(
			self.admitname, self.createdby, self.batchtype, self.stage)


class BatchItem(db.Model):
	__tablename__ = 'TBL_BATCHITEM'
	""" CONSTRAINT PK_BATCHITEM
	PRIMARY KEY (ADMITNAME, RECEIPTNO, SERIALNUMBER, OWNERCODE)
	"""
	admitname = db.Column(db.String(50), primary_key=True, nullable=False, index=True)
	receiptno = db.Column(db.String(150), primary_key=True, nullable=False, index=True)
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	dateofpayment = db.Column(db.DateTime, index=True)
	dateposted = db.Column(db.DateTime, index=True)
	paymenttype = db.Column(db.String(50), index=True)  # ! Important
	paymentamount = db.Column(db.Float, index=True)  # (mssql:money)
	paymentamountnett = db.Column(db.Float, index=True)  # (mssql:money)
	gstamount = db.Column(db.Float)  # (mssql:money)
	manualreceiptno = db.Column(db.String(50), index=True)  # ! Important
	treatasanon = db.Column(db.SmallInteger, index=True)
	tempdestinationcode = db.Column(db.String(25))
	tempdestinationcode2 = db.Column(db.String(25))
	tempsourcecode = db.Column(db.String(25))
	tempsourcecode2 = db.Column(db.String(25))
	tempcampaignyear = db.Column(db.Integer)
	tempreceiptrequired = db.Column(db.String(3))
	tempreceiptsummary = db.Column(db.String(3))
	temptaxclaimable = db.Column(db.String(3))
	temptranstype = db.Column(db.String(20))
	temppledgeplan = db.Column(db.String(20))
	temppledgetype = db.Column(db.String(20))
	tempfrequency = db.Column(db.String(20))
	tempstartdate = db.Column(db.DateTime)
	tempinstalments = db.Column(db.Float)  # (mssql:real)
	paymentratio = db.Column(db.Float)  # (mssql:money)
	narrative = db.Column(db.String(255), index=True)
	includeinthankyou = db.Column(db.SmallInteger)
	accountname = db.Column(db.String(50), index=True)
	sortcode = db.Column(db.String(50), index=True)
	accountnumber = db.Column(db.String(20), index=True)
	rollnumber = db.Column(db.String(20))
	text1 = db.Column(db.String(255))
	text2 = db.Column(db.String(255))
	bankname = db.Column(db.String(100), index=True)
	bankaddress = db.Column(db.String(255), index=True)
	bankpostcode = db.Column(db.String(10), index=True)
	creditcardtype = db.Column(db.String(20), index=True)  # ! Important
	creditcardnumber = db.Column(db.String(100), index=True)
	creditcardholder = db.Column(db.String(100), index=True)
	creditcardexpiry = db.Column(db.String(8), index=True)
	creditcardissuenumber = db.Column(db.String(5))
	creditcardauthcode = db.Column(db.String(20), index=True)
	creditcardmethod = db.Column(db.String(50), index=True)
	chequenumber = db.Column(db.String(10), index=True)
	created = db.Column(db.DateTime, index=True)  # Audit Information
	createdby = db.Column(db.String(50), index=True)  # Audit Information
	modified = db.Column(db.DateTime)  # Audit Information
	modifiedby = db.Column(db.String(50), index=True)  # Audit Information
	notes = db.Column(db.String(8000))
	result = db.Column(db.String(255))
	successfailure = db.Column(db.SmallInteger)
	applyjointsalutation = db.Column(db.SmallInteger)
	title = db.Column(db.String(30))
	firstname = db.Column(db.String(50))
	keyname = db.Column(db.String(100))
	postcode = db.Column(db.String(26))
	addressline1 = db.Column(db.String(255))
	addressline2 = db.Column(db.String(100))
	addressline3 = db.Column(db.String(100))
	addressline4 = db.Column(db.String(100))
	envelopesalutation = db.Column(db.String(100))
	lettersalutation = db.Column(db.String(100))
	reversed = db.Column(db.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	creditcardtoken = db.Column(db.String(50), index=True)
	creditcardmasked = db.Column(db.String(100))
	remainingamount = db.Column(db.Float, index=True)  # (mssql:money)
	remainingamountnett = db.Column(db.Float)  # (mssql:money)
	remaininggstamount = db.Column(db.Float)  # (mssql:money)
	orgreceiptno = db.Column(db.String(150), index=True)
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	addresstype = db.Column(db.String(50))
	daytelephone = db.Column(db.String(30))
	eveningtelephone = db.Column(db.String(30))
	faxnumber = db.Column(db.String(30))
	mobilenumber = db.Column(db.String(30))
	emailaddress = db.Column(db.String(255))
	dateofbirth = db.Column(db.DateTime)
	relationtitle = db.Column(db.String(30))
	relationfirstname = db.Column(db.String(50))
	relationkeyname = db.Column(db.String(100))
	relationship = db.Column(db.String(50))
	relationshipreverse = db.Column(db.String(50))
	addressid = db.Column(db.String(50))
	ic = db.Column(db.String(50), index=True)
	ictype = db.Column(db.String(255))
	tokengateway = db.Column(db.String(50))
	datesettled = db.Column(db.DateTime)
	bankreference = db.Column(db.String(50))
	dataimportbarcodeid = db.Column(db.String(50))
	paymentgatewayresponsecode = db.Column(db.String(50))
	""" Relationships """

	def __repr__(self):
		return "<BatchItem {} {} Payment Date: {} [{}]>".format(
			self.admitname, self.serialnumber, self.dateofpayment, self.paymenttype)


class BatchItemPledge(db.Model):
	__tablename__ = 'TBL_BATCHITEMPLEDGE'
	""" CONSTRAINT PK_BATCHITEMPLEDGE
	PRIMARY KEY (ADMITNAME, RECEIPTNO, SERIALNUMBER, LINEID)
	"""
	admitname = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	receiptno = db.Column(db.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	lineid = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	pledgeid = db.Column(db.String(150), index=True)  # ! Important Pledge ID
	pledgelineno = db.Column(db.Integer, index=True)  # ! Important Installment Number
	paymentamount = db.Column(db.Float, index=True)  # (mssql:money) ! Important
	paymentamountnett = db.Column(db.Float, index=True)  # (mssql:money) ! Important
	gstamount = db.Column(db.Float, index=True)  # (mssql:money) ! Important
	receiptrequired = db.Column(db.String(3), index=True)  # Receipting
	receiptletterid = db.Column(db.String(25), index=True)  # Receipting
	receiptsummary = db.Column(db.String(3), index=True)  # Receipting
	rcptsummaryletterid = db.Column(db.String(25), index=True)  # Receipting
	created = db.Column(db.DateTime)  # Audit Information
	createdby = db.Column(db.String(50))  # Audit Information
	modified = db.Column(db.DateTime)  # Audit Information
	modifiedby = db.Column(db.String(50))  # Audit Information
	remainingamount = db.Column(db.Float, index=True)  # (mssql:money)
	remainingamountnett = db.Column(db.Float)  # (mssql:money)
	remaininggstamount = db.Column(db.Float)  # (mssql:money)
	""" Relationships """

	def __repr__(self):
		return "<BatchItemPledge {} {} PledgeID {} installment {}>".format(
			self.admitname, self.serialnumber, self.pledgeid, self.pledgelineno)


class BatchItemSplit(db.Model):
	__tablename__ = 'TBL_BATCHITEMSPLIT'
	""" CONSTRAINT PK_BATCHITEMSPLIT
	PRIMARY KEY (ADMITNAME, RECEIPTNO, SERIALNUMBER, LINEID, SPLITID)
	"""
	admitname = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	receiptno = db.Column(db.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	lineid = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	splitid = db.Column(db.String(50), primary_key=True, nullable=False, index=True)
	externalref = db.Column(db.String(50), index=True)
	externalreftype = db.Column(db.String(50), index=True)
	taxclaimable = db.Column(db.String(4), index=True)  # Yes(Yes)/No(No)/Error(other)
	destinationcode = db.Column(db.String(25), index=True)  # ! Important
	destinationcode2 = db.Column(db.String(25), index=True)  # ! Important
	sourcecode = db.Column(db.String(25), index=True)  # ! Important
	sourcecode2 = db.Column(db.String(25), index=True)  # ! Important
	campaignyear = db.Column(db.Integer, index=True)
	paymentamount = db.Column(db.Float, index=True)  # (mssql:money) ! Important
	paymentamountnett = db.Column(db.Float, index=True)  # (mssql:money) ! Important
	gstamount = db.Column(db.Float, index=True)  # (mssql:money) ! Important
	new = db.Column(db.SmallInteger, index=True)
	existing = db.Column(db.SmallInteger, index=True)
	recovered = db.Column(db.SmallInteger, index=True)
	rank = db.Column(db.Integer, index=True)
	created = db.Column(db.DateTime)  # Audit Information
	createdby = db.Column(db.String(50))  # Audit Information
	modified = db.Column(db.DateTime)  # Audit Information
	modifiedby = db.Column(db.String(50))  # Audit Information
	remainingamount = db.Column(db.Float, index=True)  # (mssql:money)
	remainingamountnett = db.Column(db.Float)  # (mssql:money)
	remaininggstamount = db.Column(db.Float, index=True)  # (mssql:money)
	""" Relationships """

	def __repr__(self):
		return "<BatchItemSplit {} {} ${} [{}][{}]>".format(
			self.admitname, self.serialnumber, self.paymentamount, self.sourcecode, self.sourcecode2)


class SourceCode(db.Model):
	__tablename__ = 'TBL_SOURCECODE'
	""" CONSTRAINT PK_SOURCECODE
	PRIMARY KEY (SOURCECODE, OWNERCODE)
	"""
	sourcecode = db.Column(db.String(25), primary_key=True, nullable=False, index=True)  # ! Important
	sourcetype = db.Column(db.String(50), index=True)  # ! Important
	sourcedescription = db.Column(db.String(255))
	sourcenotes = db.Column(db.String(1000))
	sourcestartdate = db.Column(db.DateTime)
	sourceenddate = db.Column(db.DateTime, index=True)
	recordowner = db.Column(db.String(50), index=True)
	created = db.Column(db.DateTime)  # Audit Information
	createdby = db.Column(db.String(50))  # Audit Information
	modified = db.Column(db.DateTime)  # Audit Information
	modifiedby = db.Column(db.String(50))  # Audit Information
	excludefromdropdown = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	sourcetarget = db.Column(db.Float, index=True)  # (mssql:money)
	sourcebudget = db.Column(db.Float, index=True)  # (mssql:money)
	destinationcode = db.Column(db.String(25), index=True)
	destinationcode2 = db.Column(db.String(25), index=True)
	taxdeductible = db.Column(db.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	goodstaxapplicable = db.Column(db.SmallInteger, default=0, index=True)
	excludefromstatistics = db.Column(db.SmallInteger, index=True)
	additionalcode1 = db.Column(db.String(50), index=True)  # ! Important QB Account
	additionalcode2 = db.Column(db.String(50), index=True)
	additionalcode3 = db.Column(db.String(50), index=True)  # ! Important TQ Campaign
	additionalcode4 = db.Column(db.String(50), index=True)
	additionalcode5 = db.Column(db.String(50), index=True)  # ! Important QB Class
	availontimesheet = db.Column(db.SmallInteger, index=True)
	separatereceipts = db.Column(db.String(50), index=True)
	lotteryflag = db.Column(db.SmallInteger, index=True)
	sourcecode2 = db.Column(db.String(50), index=True)
	accountname = db.Column(db.String(50))
	sortcode = db.Column(db.String(50))
	accountnumber = db.Column(db.String(20))
	bankname = db.Column(db.String(100))
	bankaddress = db.Column(db.String(255))
	bankpostcode = db.Column(db.String(10))
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	edhevent = db.Column(db.String(255), index=True)
	inputtaxed = db.Column(db.SmallInteger, index=True)
	category = db.Column(db.String(50))  # ! Important
	netreporting = db.Column(db.SmallInteger)
	auditnote = db.Column(db.Text, default='')  # (mssql:varchar(max))
	""" Relationships """

	def __repr__(self):
		return "<SS1 {}, QB {}.{}, {}".format(
			self.sourcecode, self.additionalcode1, self.additionalcode5, self.additionalcode3)


class Sourcecode2(db.Model):
	__tablename__ = 'TBL_SOURCECODE2'
	""" CONSTRAINT PK_SOURCECODE2
	PRIMARY KEY (SOURCECODE2, OWNERCODE)
	"""
	sourcecode2 = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = db.Column(db.String(50), index=True)
	category = db.Column(db.String(50), index=True)  # ! Important
	type = db.Column(db.String(50), index=True)  # ! Important
	description = db.Column(db.String(255), index=True)
	notes = db.Column(db.String(2500))
	excludefromdropdown = db.Column(db.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = db.Column(db.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	created = db.Column(db.DateTime, index=True)  # Audit Information
	createdby = db.Column(db.String(50), index=True)  # Audit Information
	modified = db.Column(db.DateTime, index=True)  # Audit Information
	modifiedby = db.Column(db.String(50), index=True)  # Audit Information
	prefix = db.Column(db.String(50), index=True)
	lowermanualreceiptno = db.Column(db.Integer, index=True)
	uppermanualreceiptno = db.Column(db.Integer, index=True)
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	target = db.Column(db.Float)  # (mssql:money)
	""" Relationships """

	def __repr__(self):
		return "<SS2 {}".format(self.sourcecode2)


class DestinationCode(db.Model):
	__tablename__ = 'TBL_DESTINATIONCODE'
	""" CONSTRAINT PK_DESTINATIONCODE
	PRIMARY KEY (DESTINATIONCODE, OWNERCODE)
	"""
	destinationcode = db.Column(db.String(25), primary_key=True, nullable=False, index=True)  # ! Important
	destinationtype = db.Column(db.String(50), index=True)  # ! Important
	destinationdescription = db.Column(db.String(255), index=True)  # ! Important
	destinationnotes = db.Column(db.String(1000))  # ! Important
	ledgercode = db.Column(db.String(50), index=True)  # ! Important
	recordowner = db.Column(db.String(25), index=True)
	modified = db.Column(db.DateTime)  # Audit Information
	modifiedby = db.Column(db.String(50))  # Audit Information
	created = db.Column(db.DateTime)  # Audit Information
	createdby = db.Column(db.String(50))  # Audit Information
	excludefromdropdown = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = db.Column(db.Float, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	availontimesheet = db.Column(db.SmallInteger, index=True)
	additionalcode1 = db.Column(db.String(255), index=True)
	additionalcode2 = db.Column(db.String(50), index=True)
	additionalcode3 = db.Column(db.String(255), index=True)
	additionalcode4 = db.Column(db.String(50), index=True)
	additionalcode5 = db.Column(db.String(50), index=True)
	receiptsplitorder = db.Column(db.Integer, index=True)
	reportfinancesystemdetail = db.Column(db.SmallInteger, index=True)
	accountname = db.Column(db.String(50))
	sortcode = db.Column(db.String(50))
	accountnumber = db.Column(db.String(20))
	bankname = db.Column(db.String(100))
	bankaddress = db.Column(db.String(255))
	bankpostcode = db.Column(db.String(10))
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	gatewayname = db.Column(db.String(50))
	nonallocable = db.Column(db.SmallInteger, index=True)
	""" Relationships """

	def __repr__(self):
		return "<DS1 {}".format(self.destinationcode)


class DestinationCode2(db.Model):
	__tablename__ = 'TBL_DESTINATIONCODE2'
	""" CONSTRAINT PK_DESTINATIONCODE2
	PRIMARY KEY (DESTINATIONCODE2, OWNERCODE)
	"""
	destinationcode2 = db.Column(db.String(25), primary_key=True, nullable=False, index=True)  # ! Important
	destinationtype = db.Column(db.String(50), index=True)  # ! Important
	destinationdescription = db.Column(db.String(255), index=True)  # ! Important
	destinationnotes = db.Column(db.String(1000))  # ! Important
	ledgercode = db.Column(db.String(50), index=True)  # ! Important
	recordowner = db.Column(db.String(25), index=True)
	modified = db.Column(db.DateTime, index=True)  # Audit Information
	modifiedby = db.Column(db.String(50), index=True)  # Audit Information
	created = db.Column(db.DateTime, index=True)  # Audit Information
	createdby = db.Column(db.String(50), index=True)  # Audit Information
	excludefromdropdown = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	archive = db.Column(db.Float, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	""" Relationships """

	def __repr__(self):
		return "<DS2 {}".format(self.destinationcode2)


class Contact(db.Model):
	__tablename__ = 'TBL_CONTACT'
	""" CONSTRAINT PK_CONTACT
	PRIMARY KEY (SERIALNUMBER, OWNERCODE)
	"""
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	contacttype = db.Column(db.String(15), index=True)  # ! Important
	title = db.Column(db.String(30), index=True)  # ! Important
	firstname = db.Column(db.String(50), index=True)  # ! Important
	otherinitial = db.Column(db.String(50), index=True)  # ! Important
	keyname = db.Column(db.String(100), index=True)  # ! Important
	postnominal = db.Column(db.String(20))
	envelopesalutation = db.Column(db.String(100))
	lettersalutation = db.Column(db.String(100))
	contactposition = db.Column(db.String(200))
	careof = db.Column(db.String(100), index=True)
	addresstype = db.Column(db.String(50))
	country = db.Column(db.String(50))  # ! Important
	postcode = db.Column(db.String(10), index=True)  # ! Important
	addressline1 = db.Column(db.String(255), index=True)
	addressline2 = db.Column(db.String(100))
	addressline3 = db.Column(db.String(100), index=True)  # ! Important Suburb
	addressline4 = db.Column(db.String(100), index=True)  # ! Important State
	addressline5 = db.Column(db.String(100))
	addressline6 = db.Column(db.String(100))
	addresscode1 = db.Column(db.String(50))
	addresscode2 = db.Column(db.String(50))
	addresscode3 = db.Column(db.String(50))
	salesregion = db.Column(db.String(50), index=True)
	daytelephone = db.Column(db.String(30))
	eveningtelephone = db.Column(db.String(30))
	faxnumber = db.Column(db.String(30))
	mobilenumber = db.Column(db.String(30), index=True)
	emailaddress = db.Column(db.String(255), index=True)  # ! Important
	website = db.Column(db.String(150))
	charitynumber = db.Column(db.Float)
	primarycategory = db.Column(db.String(50), index=True)  # ! Important
	occupation = db.Column(db.String(50))
	dateofbirth = db.Column(db.DateTime)
	gender = db.Column(db.String(10))
	previousnames = db.Column(db.String(255))
	maritalstatus = db.Column(db.String(25))
	taxstatus = db.Column(db.String(25))
	preferredmethod = db.Column(db.String(10), index=True)
	donotmail = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	donotmailreason = db.Column(db.String(50), index=True)  # ! Important
	donotmailfrom = db.Column(db.DateTime, index=True)  # ! Important
	donotmailuntil = db.Column(db.DateTime, index=True)  # ! Important
	source = db.Column(db.String(50))  # ! Important
	recordowner = db.Column(db.String(50))
	picturefile = db.Column(db.String(50))
	created = db.Column(db.DateTime)  # (mssql:datetime2) Audit Information
	createdby = db.Column(db.String(50))  # Audit Information
	modified = db.Column(db.DateTime)  # (mssql:datetime2) Audit Information
	modifiedby = db.Column(db.String(50))  # Audit Information
	defaultaddress = db.Column(db.String(50), index=True)
	useaddressfrom = db.Column(db.DateTime, index=True)
	useaddressuntil = db.Column(db.DateTime, index=True)
	gadstatus = db.Column(db.String(25))
	vip = db.Column(db.SmallInteger, index=True)
	maincontact = db.Column(db.String(50), index=True)
	abn = db.Column(db.String(100), index=True)
	majordonor = db.Column(db.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	bequestprospect = db.Column(db.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	sortkey = db.Column(db.String(255), index=True)
	sortkeyref1 = db.Column(db.String(50))
	sortkeyrefrel1 = db.Column(db.String(50))
	sortkeyrefrel2 = db.Column(db.String(50))
	anonymous = db.Column(db.SmallInteger, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	recordviewto = db.Column(db.String(50), index=True)
	lga = db.Column(db.String(50))
	sedupper = db.Column(db.String(50))
	sedlower = db.Column(db.String(50))
	emailok = db.Column(db.String(10), index=True)
	emailerror = db.Column(db.String(255))
	ccemailok = db.Column(db.String(10), index=True)
	ccemailerror = db.Column(db.String(255))
	bequestnote = db.Column(db.String(8000))
	webusername = db.Column(db.String(50), index=True)
	webpassword = db.Column(db.String(255))
	webpublish = db.Column(db.SmallInteger, index=True)
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	coaflag = db.Column(db.Integer)
	coadate = db.Column(db.DateTime)
	skypename = db.Column(db.String(50))
	twitterhandle = db.Column(db.String(50))  # Social Media
	facebookurl = db.Column(db.String(255))  # Social Media
	linkedinurl = db.Column(db.String(255))  # Social Media
	""" Relationships """

	def __repr__(self):
		return "<Contact {}".format(self.serialnumber)


class ContactAttribute(db.Model):
	__tablename__ = 'TBL_CONTACTATTRIBUTE'
	""" CONSTRAINT PK_CONTACTATTRIBUTE
	PRIMARY KEY (SERIALNUMBER)
	"""
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False, index=True)
	htmlnotes = db.Column(db.Text)  # (mssql:varchar(max))
	countamount = db.Column(db.Float, index=True)
	sumamount = db.Column(db.Float, index=True)
	maxamount = db.Column(db.Float, index=True)
	avgamount = db.Column(db.Float)
	maxdate = db.Column(db.DateTime, index=True)
	mindate = db.Column(db.DateTime, index=True)
	leadcontact = db.Column(db.SmallInteger, default=0)
	jointsalutation = db.Column(db.String(255), index=True)
	jointlettersalutation = db.Column(db.String(255), index=True)
	defaulttitle = db.Column(db.String(30))
	defaultfirstname = db.Column(db.String(50), index=True)
	defaultkeyname = db.Column(db.String(100), index=True)
	defaultaddressline1 = db.Column(db.String(255), index=True)
	defaultaddressline2 = db.Column(db.String(100))
	defaultaddressline3 = db.Column(db.String(100), index=True)
	defaultaddressline4 = db.Column(db.String(100), index=True)
	defaultpostcode = db.Column(db.String(10), index=True)
	defaultcountry = db.Column(db.String(50))
	defaultaddresscode1 = db.Column(db.String(50))
	defaultaddresscode2 = db.Column(db.String(50))
	externalref = db.Column(db.String(50), index=True)
	externalreftype = db.Column(db.String(50), index=True)
	externalrefdate = db.Column(db.DateTime, index=True)
	subaddress = db.Column(db.String(100))
	plaintextemail = db.Column(db.SmallInteger, default=0, index=True)
	picturefile2 = db.Column(db.String(50))
	donotcall = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	secondcontact = db.Column(db.String(50), index=True)
	canvassee = db.Column(db.SmallInteger, default=0, index=True)
	donotpublish = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	volunteer = db.Column(db.SmallInteger, default=0, index=True)
	volsource = db.Column(db.String(30), index=True)
	volspecialreq = db.Column(db.String(255))
	emergencyname = db.Column(db.String(200))
	emergencynumber = db.Column(db.String(30))
	volunteermanager = db.Column(db.String(200))
	donotvolunteer = db.Column(db.SmallInteger, default=0, index=True)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	crmprimarymanager = db.Column(db.String(50), default=0, index=True)  # CRM Information
	crmsecondarymanager = db.Column(db.String(50))  # CRM Information
	crmplan = db.Column(db.String(20))  # CRM Information
	crmrefermanager = db.Column(db.SmallInteger, index=True)  # CRM Information
	crmnote = db.Column(db.String(1500))
	ccemailaddress = db.Column(db.String(255))
	ccname = db.Column(db.String(255))
	source2 = db.Column(db.String(50))
	defaultsource2 = db.Column(db.String(50))
	medicalref1 = db.Column(db.String(50))
	medicalref2 = db.Column(db.String(50))
	medicalref2date = db.Column(db.DateTime)
	defaultreceiptrequired = db.Column(db.String(3), index=True)
	defaultreceiptsummary = db.Column(db.String(3), index=True)
	sourcedate = db.Column(db.DateTime)
	tempmaintitle = db.Column(db.String(30))
	tempmainfirstname = db.Column(db.String(50))
	tempmainkeyname = db.Column(db.String(100))
	tempsecondarytitle = db.Column(db.String(30))
	tempsecondaryfirstname = db.Column(db.String(50))
	tempsecondarykeyname = db.Column(db.String(100))
	defaultproductlevel = db.Column(db.String(255))
	nickname = db.Column(db.String(255), index=True)
	configtext1 = db.Column(db.String(255))
	configtext2 = db.Column(db.String(255))
	configtext3 = db.Column(db.String(255))
	configtext4 = db.Column(db.String(255))
	configtext5 = db.Column(db.String(255))
	ic = db.Column(db.String(50), index=True)
	ictype = db.Column(db.String(255))
	alttitle = db.Column(db.String(500))
	altfirstname = db.Column(db.String(500))
	altkeyname = db.Column(db.String(500))
	altaddress = db.Column(db.String(4000))
	donotemail = db.Column(db.SmallInteger, default=0)  # ! Important Yes(-1)/No(0, Null)/Error(other)
	sumamountsoft = db.Column(db.Float)
	countamountsoft = db.Column(db.Integer)
	sumamounthardnsoft = db.Column(db.Float)
	countamounthardnsoft = db.Column(db.Integer)
	referralsource = db.Column(db.String(50))
	qldhealthregion = db.Column(db.String(50))
	qldregion = db.Column(db.String(100))
	islander = db.Column(db.SmallInteger)
	writtenprivacyconsentheld = db.Column(db.SmallInteger)
	verbalprivacyconsentgiven = db.Column(db.SmallInteger)
	notes = db.Column(db.Text)  # (mssql:varchar(max))
	""" Relationships """

	def __repr__(self):
		return "<ContactAttribute {}".format(self.serialnumber)


class ContactParameter(db.Model):
	__tablename__ = 'TBL_CONTACTPARAMETER'
	""" CONSTRAINT PK_CONTACTPARAMETER
	PRIMARY KEY (SERIALNUMBER, PARAMETERNAME, PARAMETERVALUE, ADDITIONAL1, ADDITIONAL2, ADDITIONAL3, OWNERCODE)
	"""
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	parametername = db.Column(db.String(100), primary_key=True, nullable=False, index=True)  # ! Important
	parametervalue = db.Column(db.String(200), primary_key=True, nullable=False, index=True)  # ! Important
	effectivefrom = db.Column(db.DateTime, index=True)  # ! Important
	effectiveto = db.Column(db.DateTime, index=True)  # ! Important
	parameternote = db.Column(db.String(2000))
	additional1 = db.Column(db.String(100), primary_key=True, nullable=False, default='', index=True)
	additional2 = db.Column(db.String(100), primary_key=True, nullable=False, default='', index=True)
	additional3 = db.Column(db.String(100), primary_key=True, nullable=False, default='', index=True)
	additional4 = db.Column(db.String(100))
	additional5 = db.Column(db.String(1000))
	priority = db.Column(db.String(50), index=True)
	created = db.Column(db.DateTime, index=True)  # Audit Information
	createdby = db.Column(db.String(50), index=True)  # Audit Information
	modified = db.Column(db.DateTime, index=True)  # Audit Information
	modifiedby = db.Column(db.String(50), index=True)  # Audit Information
	recordowner = db.Column(db.String(50), index=True)
	id = db.Column(db.Integer, index=True)  # (mssql:INT IDENTITY)
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	""" Relationships """

	def __repr__(self):
		return "<ContactParameter {}, {}/{}>".format(
			self.serialnumber, self.parametername, self.parametervalue)


class Communication(db.Model):
	__tablename__ = 'TBL_COMMUNICATION'
	""" CONSTRAINT PK_COMMUNICATION
	PRIMARY KEY (COMMUNICATIONREF, SERIALNUMBER, OWNERCODE)
	"""
	communicationref = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False, index=True)  # ! Important
	communicationtype = db.Column(db.String(50), index=True)  # ! Important
	externalref = db.Column(db.String(50), index=True)  # External Reference
	externalreftype = db.Column(db.String(50), index=True)  # External Reference
	crmflag = db.Column(db.String(3), index=True)  # Flag : Yes(Yes)/No(No)/Error(other)
	dateofcommunication = db.Column(db.DateTime, index=True)  # ! Important
	subject = db.Column(db.String(255), index=True)  # ! Important
	notes = db.Column(db.Text, index=True)  # (mssql:varchar(max)) ! Important  #
	created = db.Column(db.DateTime, index=True)  # Audit Information
	createdby = db.Column(db.String(50), index=True)  # Audit Information
	modified = db.Column(db.DateTime, index=True)  # Audit Information
	modifiedby = db.Column(db.String(50), index=True)  # Audit Information
	priority = db.Column(db.String(50), index=True)
	attachmenticon = db.Column(db.Integer)
	recordowner = db.Column(db.String(50), index=True)
	accessrights = db.Column(db.String(255), index=True)
	confidential = db.Column(db.SmallInteger, index=True)
	response = db.Column(db.String(50), index=True)
	category = db.Column(db.String(50), index=True)  # ! Important
	timeofcommunication = db.Column(db.String(10), index=True)  # ! Important
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, default=0, index=True)
	sticky = db.Column(db.Integer, index=True)  # (mssql:bit), Yes(-1)/No(0, Null)/Error(other)
	reply = db.Column(db.String(1000))
	replydatetime = db.Column(db.DateTime)
	""" Relationships """

	def __repr__(self):
		return "<Communication {},{} CreatedBy {}, Type{} Category{}>".format(
			self.communicationref, self.serialnumber, self.createdby, self.communicationtype, self.category)


class PledgeHeader(db.Model):
	__tablename__ = 'TBL_PLEDGEHEADER'
	""" CONSTRAINT PK_PLEDGEHEADER
	PRIMARY KEY (PLEDGEID, OWNERCODE)
	"""
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False, index=True)
	# !! Key Information
	pledgestatus = db.Column(db.String(25), index=True)
	serialnumber = db.Column(db.String(50), nullable=False, index=True)
	description = db.Column(db.String(255), index=True)
	pledgeplan = db.Column(db.String(50), index=True)
	pledgetype = db.Column(db.String(25), index=True)
	currency = db.Column(db.String(25))
	# Source Codes : Not working properly
	sourcecode = db.Column(db.String(25))
	sourcecode2 = db.Column(db.String(25))
	# Campaign Year : Not using properly
	campaignyear = db.Column(db.Integer)
	# !! Key Information
	paymenttype = db.Column(db.String(25), index=True)
	# Receipt
	receiptrequired = db.Column(db.String(4), index=True)
	receiptsummary = db.Column(db.String(4), index=True)
	receiptfrequency = db.Column(db.String(25))
	nextreceiptdate = db.Column(db.DateTime)
	# !! Key Information
	startdate = db.Column(db.DateTime, index=True)
	enddate = db.Column(db.DateTime)
	# Payments
	totalvalue = db.Column(db.Float, index=True)  # mssql: money
	instalmentvalue = db.Column(db.Float)  # mssql: money
	paymentfrequency = db.Column(db.String(25))
	maxpayments = db.Column(db.Integer)
	accountname = db.Column(db.String(50))
	sortcode = db.Column(db.String(10), index=True)
	accountnumber = db.Column(db.String(20))
	rollnumber = db.Column(db.String(20))
	text1 = db.Column(db.String(255))
	text2 = db.Column(db.String(255))
	# Bank info
	bankname = db.Column(db.String(100))
	bankaddress = db.Column(db.String(255))
	bankpostcode = db.Column(db.String(10))
	# CC info
	creditcardtype = db.Column(db.String(20), index=True)
	creditcardnumber = db.Column(db.String(100))
	creditcardholder = db.Column(db.String(100), index=True)
	creditcardexpiry = db.Column(db.String(8))
	creditcardissuenumber = db.Column(db.String(5))
	creditcardmethod = db.Column(db.String(50))

	pledgerecruitedby = db.Column(db.String(255))
	pledgerecruitedbyevent = db.Column(db.String(25))
	recordowner = db.Column(db.String(25))

	created = db.Column(db.DateTime)  # Audit Information
	createdby = db.Column(db.String(50))  # Audit Information
	modified = db.Column(db.DateTime)  # Audit Information
	modifiedby = db.Column(db.String(50))  # Audit Information

	taxclaimable = db.Column(db.String(4))  # Yes/No/(other)
	# External Reference
	externalref = db.Column(db.String(25), index=True)
	externalreftype = db.Column(db.String(25), index=True)

	escalationletter = db.Column(db.SmallInteger)
	lastescalationdate = db.Column(db.DateTime)

	membership = db.Column(db.SmallInteger)
	membershipid = db.Column(db.String(50))
	subscription = db.Column(db.SmallInteger)
	subscriptionid = db.Column(db.String(50))
	# Ignore
	new = db.Column(db.SmallInteger)
	existing = db.Column(db.SmallInteger, index=True)
	recovered = db.Column(db.SmallInteger, index=True)
	# Acknowledge
	acknowledge = db.Column(db.String(4))  # Yes/No/(other)
	acknowledgedate = db.Column(db.DateTime)
	acknowledgeletter = db.Column(db.String(50))

	totalpaid = db.Column(db.Float, index=True)  # mssql: money
	outstanding = db.Column(db.Float, index=True)  # mssql: money
	originaltotalvalue = db.Column(db.Float)  # mssql: money
	oneoff = db.Column(db.String(4))
	# Serial Number Info
	title = db.Column(db.String(30))
	firstname = db.Column(db.String(50), index=True)
	keyname = db.Column(db.String(100), index=True)
	# WrittenDown
	writtendownreason = db.Column(db.String(100), index=True)
	writtendown = db.Column(db.DateTime, index=True)
	writtendownby = db.Column(db.String(50), index=True)
	# OnHold
	onholdreason = db.Column(db.String(100), index=True)
	onholddatetime = db.Column(db.DateTime, index=True)
	onholdby = db.Column(db.String(50), index=True)

	reminder = db.Column(db.String(3), index=True)  # Yes/No/(other)

	creditcardtoken = db.Column(db.String(50))
	creditcardmasked = db.Column(db.String(100))
	ownercode = db.Column(db.Integer, primary_key=True, nullable=False, index=True)
	tokengateway = db.Column(db.String(50))

	onreactivationlist = db.Column(db.String(50))
	reactivationfollowup = db.Column(db.DateTime)

	pledgerecruitedbydate = db.Column(db.DateTime)
	recruiterid = db.Column(db.String(20))
	fundraiserid = db.Column(db.String(20))
	recruitmentagencyid = db.Column(db.String(20))
	recruitmentmethod = db.Column(db.String(50))
	recruitmentlocation = db.Column(db.String(100))

	nextcalldate = db.Column(db.DateTime)
	calloutcome = db.Column(db.String(50))
	calldetail = db.Column(db.String(2000))
	currentyearvalue = db.Column(db.Float)  # mssql: money
	""" Relationships """

	def __repr__(self):
		return "<Pledge {},{} CreatedBy {}, Recruited {}>".format(
			self.pledgeid, self.serialnumber, self.createdby, self.pledgerecruitedby)


class PledgeHeaderAttribute(db.Model):
	__tablename__ = 'TBL_PLEDGEHEADERATTRIBUTE'
	""" CONSTRAINT PK_PLEDGEHEADERATTRIBUTE
	PRIMARY KEY (PLEDGEID)
	"""
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False, index=True)
	# Redundant
	destinationcode = db.Column(db.String(50), index=True)
	destinationcode2 = db.Column(db.String(50), index=True)
	paymentratio = db.Column(db.Float, index=True)  # mssql: money
	# !! Key Information
	notes = db.Column(db.Text)  # mssql: varchar(max)
	auditnotes = db.Column(db.String(8000))
	# CC Info
	creditcardmasked = db.Column(db.String(100))
	""" Relationships """

	def __repr__(self):
		return "<Pledge Attributes {} >".format(self.pledgeid)


class PledgeHeaderRelationship(db.Model):
	__tablename__ = 'TBL_PLEDGEHEADERRELATIONSHIP'
	# Primary Key
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False)
	serialnumber = db.Column(db.String(50), primary_key=True, nullable=False)
	# Designation : PRIMARY / SOFT
	designation = db.Column(db.String(10), index=True)
	""" Relationships """

	def __repr__(self):
		return "<Pledge {},{} ({})>".format(
			self.pledgeid, self.serialnumber, self.designation)


class PledgeDestination(db.Model):
	__tablename__ = 'TBL_PLEDGEDESTINATION'
	# Primary Key
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False, index=True)
	autoid = db.Column(db.Numeric(18), primary_key=True, nullable=False, index=True)
	# Source Codes
	sourcecode = db.Column(db.String(50), index=True)
	sourcecode2 = db.Column(db.String(50), index=True)
	# Destination Codes
	destinationcode = db.Column(db.String(50), index=True)
	destinationcode2 = db.Column(db.String(50), index=True)
	# Other
	campaignyear = db.Column(db.Integer, index=True)
	paymentratio = db.Column(db.Float, index=True)  # mssql: money
	""" Relationships """

	def __repr__(self):
		return "<Pledge S/D {} ({}/{}) ({}/{})>".format(
			self.pledgeid, self.sourcecode, self.sourcecode2, self.destinationcode, self.destinationcode2)


class PledgeInstalmentsActive(db.Model):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_ACTIVE'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_ACTIVE
	PRIMARY KEY (PLEDGEID, INSTALMENTID)
	"""
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	instalmentid = db.Column(db.Float, primary_key=True, nullable=False, index=True)  # ! Important
	instalment = db.Column(db.Float, index=True)  # mssql: money  ! Important
	datedue = db.Column(db.DateTime, index=True)  # ! Important
	amountpaid = db.Column(db.Float, index=True)  # mssql: money  ! Important
	onhold = db.Column(db.SmallInteger, index=True)  # Yes(-1)/No(0, Null)/Error(other)
	campaignyear = db.Column(db.Integer, index=True)
	comments = db.Column(db.String(3000))
	invoicenth = db.Column(db.Numeric(18), index=True)
	""" Relationships """

	def __repr__(self):
		return "<PledgeA {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)


class PledgeInstalmentsClosed(db.Model):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_CLOSED'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_CLOSED
	PRIMARY KEY (PLEDGEID, INSTALMENTID)
	"""
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	instalmentid = db.Column(db.Float, primary_key=True, nullable=False, index=True)  # ! Important
	instalment = db.Column(db.Float, index=True)  # mssql: money  ! Important
	datedue = db.Column(db.DateTime, index=True)
	amountpaid = db.Column(db.Float, index=True)  # mssql: money  ! Important
	campaignyear = db.Column(db.Integer, index=True)
	comments = db.Column(db.String(3000))
	invoicenth = db.Column(db.Numeric(18), index=True)
	""" Relationships """

	def __repr__(self):
		return "<PledgeC {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)


class PledgeInstalmentsWrittenOff(db.Model):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_WRITTENOFF'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_WRITTENOFF
	PRIMARY KEY (PLEDGEID, INSTALMENTID)
	"""
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False, index=True)  # ! Important
	instalmentid = db.Column(db.Float, primary_key=True, nullable=False, index=True)  # ! Important
	instalment = db.Column(db.Float, index=True)  # mssql: money ! Important
	datedue = db.Column(db.DateTime, index=True)  # ! Important
	amountpaid = db.Column(db.Float, index=True)  # mssql: money
	originalinstalment = db.Column(db.Float, index=True)  # mssql: money
	campaignyear = db.Column(db.Integer, index=True)
	comments = db.Column(db.String(3000))
	invoicenth = db.Column(db.Numeric(18), index=True)
	writtendown = db.Column(db.DateTime)  # ! Important
	writtendownby = db.Column(db.String(50))  # ! Important
	writtendownreason = db.Column(db.String(100))  # ! Important
	""" Relationships """

	def __repr__(self):
		return "<PledgeR {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)


class PledgeInstalmentsFailure(db.Model):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_FAILURE'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_FAILURE
	PRIMARY KEY (ID)
	"""
	id = db.Column(db.Integer, primary_key=True, nullable=False, index=True)  # ! Important
	pledgeid = db.Column(db.String(150), index=True)  # ! Important
	instalmentid = db.Column(db.Float)  # ! Important
	batchid = db.Column(db.String(50))  # ! Important Batch Item Info
	receiptno = db.Column(db.String(150))  # ! Important Batch Item Info
	dateofpayment = db.Column(db.DateTime)  # ! Important Batch Item Info
	result = db.Column(db.String(255))  # ! Important
	created = db.Column(db.DateTime)  # Audit Information
	createdby = db.Column(db.String(50))  # Audit Information
	modified = db.Column(db.DateTime)  # Audit Information
	modifiedby = db.Column(db.String(50))  # Audit Information
	automationflag = db.Column(db.Integer)
	""" Relationships """

	def __repr__(self):
		return "<PledgeF {} Ins {} FailureID {}>".format(
			self.pledgeid, self.instalmentid, self.id)


class PledgeInstalmentsNextActive(db.Model):
	__tablename__ = 'TBL_PLEDGEINSTALMENTS_NEXTACTIVE'
	""" CONSTRAINT PK_PLEDGEINSTALMENTS_NEXTACTIVE
	PRIMARY KEY (PLEDGEID)
	"""
	pledgeid = db.Column(db.String(150), primary_key=True, nullable=False, index=True)
	instalmentid = db.Column(db.Float, index=True)   # ! Important
	instalment = db.Column(db.Float, index=True)  # mssql: money  ! Important
	datedue = db.Column(db.DateTime, index=True)  # ! Important
	amountpaid = db.Column(db.Float, index=True)  # mssql: money
	""" Relationships """

	def __repr__(self):
		return "<PledgeN {} Ins {} ${} Due {}>".format(
			self.pledgeid, self.instalmentid, self.instalment, self.datedue)
