DECLARE @FYOFFSET AS INT;
SET @FYOFFSET=/*<FY_OFFSET>*/0/*</FY_OFFSET>*/;

WITH
-- --------------------------------------------------------------
cte_pledge_source as (
  SELECT TBL_PLEDGEDESTINATION.PLEDGEID
    ,SOURCECODES=COUNT(TBL_PLEDGEDESTINATION.SOURCECODE)
    ,FIRST_SOURCECODE=IIF(RTRIM(ISNULL(MIN(TBL_PLEDGEDESTINATION.SOURCECODE),''))='',':BLANK', MIN(TBL_PLEDGEDESTINATION.SOURCECODE))
  FROM TBL_PLEDGEDESTINATION
  GROUP BY PLEDGEID
)
-- --------------------------------------------------------------
, cte_pledge_sourcetype as (
  SELECT
    cps.PLEDGEID, cps.FIRST_SOURCECODE, cps.SOURCECODES
    ,TBL_SOURCECODE.SOURCETYPE
  FROM cte_pledge_source cps LEFT JOIN TBL_SOURCECODE ON (cps.FIRST_SOURCECODE = TBL_SOURCECODE.SOURCECODE)
)
-- --------------------------------------------------------------
, cte_pledge as (
  SELECT PLE1.PLEDGEID
    ,PLE1.STARTDATE,PLE1.ENDDATE
    ,[DESCRIPTION] = IIF(RTRIM(ISNULL(PLE1.DESCRIPTION,''))='',':BLANK', PLE1.DESCRIPTION)
    ,[RECRUITCAMPAIGN] = IIF(RTRIM(ISNULL(PLE1.RECRUITMENTMETHOD,''))='',':BLANK', PLE1.RECRUITMENTMETHOD)
    ,[RECRUITMETHOD] = IIF(RTRIM(ISNULL(PLE1.PLEDGERECRUITEDBY,''))='',':BLANK', PLE1.PLEDGERECRUITEDBY)
    ,[STATUS] = IIF(RTRIM(ISNULL(PLE1.PLEDGESTATUS,''))='',':BLANK', PLE1.PLEDGESTATUS)
    ,[PLAN] = IIF(RTRIM(ISNULL(PLE1.PLEDGEPLAN,''))='',':BLANK', PLE1.PLEDGEPLAN)
    ,[TYPE] = IIF(RTRIM(ISNULL(PLE1.PLEDGETYPE,''))='',':BLANK', PLE1.PLEDGETYPE)
    ,[PAYMENTFREQUENCY] = IIF(RTRIM(ISNULL(PLE1.PAYMENTFREQUENCY,''))='',':BLANK', PLE1.PAYMENTFREQUENCY)
    ,[PAYMENTTYPE] = IIF(PLE1.PAYMENTTYPE IS NULL OR RTRIM(PLE1.PAYMENTTYPE)='',':BLANK', PLE1.PAYMENTTYPE)
    ,[INSTALMENTVALUE] = ISNULL(PLE1.INSTALMENTVALUE,0)
    ,PLE1.CREATED, PLE1.CREATEDBY
  FROM
    TBL_PLEDGEHEADER PLE1
  WHERE
    (PLE1.EXTERNALREF IS NULL OR RTRIM(PLE1.EXTERNALREF)='') AND (PLE1.EXTERNALREFTYPE IS NULL OR RTRIM(PLE1.EXTERNALREFTYPE)='')
    AND (PLE1.DESCRIPTION IS NULL OR PLE1.DESCRIPTION NOT LIKE '%MERCHANDISE%')
    AND PLE1.CREATED >= DATEFROMPARTS(/*<START_YEAR>*/YEAR(GETDATE())+IIF(MONTH(GETDATE())<7,0,1)-1-@FYOFFSET/*</START_YEAR>*/,/*<START_MTH>*/7/*</START_MTH>*/,/*<START_DAY>*/1/*</START_DAY>*/)
    AND PLE1.CREATED <= DATEFROMPARTS(/*<END_YEAR>*/YEAR(GETDATE())+IIF(MONTH(GETDATE())<7,0,1)-@FYOFFSET/*</END_YEAR>*/,/*<END_MTH>*/6/*</END_MTH>*/,/*<END_DAY>*/30/*</END_DAY>*/)
)
-- --------------------------------------------------------------
, cte_pledge_total as (
  SELECT
    TBL_BATCHITEMPLEDGE.PLEDGEID
    ,[LTD_TOTAL] = SUM(TBL_BATCHITEMPLEDGE.PAYMENTAMOUNT)
    ,[PAID_INSTALMENTS] = COUNT(DISTINCT TBL_BATCHITEMPLEDGE.PLEDGELINENO)
  FROM
    TBL_BATCHITEMPLEDGE
    LEFT JOIN TBL_BATCHITEM ON (TBL_BATCHITEMPLEDGE.ADMITNAME = TBL_BATCHITEM.ADMITNAME AND TBL_BATCHITEMPLEDGE.RECEIPTNO = TBL_BATCHITEM.RECEIPTNO AND TBL_BATCHITEMPLEDGE.SERIALNUMBER = TBL_BATCHITEM.SERIALNUMBER)
  WHERE
    TBL_BATCHITEM.REVERSED IS NULL OR NOT(TBL_BATCHITEM.REVERSED=1 OR TBL_BATCHITEM.REVERSED=-1)
  GROUP BY
    TBL_BATCHITEMPLEDGE.PLEDGEID
)
-- --------------------------------------------------------------
, cte_legit_pledge as (
  SELECT P1.*
    ,P3.LTD_TOTAL, P3.PAID_INSTALMENTS
    ,P2.FIRST_SOURCECODE, P2.SOURCECODES
  FROM
    cte_pledge P1
    LEFT JOIN cte_pledge_sourcetype P2 ON (P1.PLEDGEID=P2.PLEDGEID)
    LEFT JOIN cte_pledge_total P3 ON (P1.PLEDGEID=P3.PLEDGEID)
  WHERE
    P2.SOURCETYPE <> 'Bequest'
)
-- --------------------------------------------------------------

select * from cte_legit_pledge
order by CREATED desc