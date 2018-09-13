DECLARE
  @DATE1 VARCHAR (10) = /*<DATE_START>*/'2018/07/01'/*</DATE_START>*/,
  @DATE2 VARCHAR (10) = /*<DATE_END>*/'2019/06/30'/*</DATE_END>*/;
--  @REX_RECEIPT_PREFIX VARCHAR(20) = 'REX Order Number:'
-- , @REX_RECEIPT_PATTERN VARCHAR(100) = '%[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
-- , @REX_RECEIPT_NOTE_PATTERN VARCHAR(100)
-- , @D1 DATE = /*<START_DATE>*/'2017/07/01'/*</START_DATE>*/
-- , @D2 DATE = /*<END_DATE>*/'2018/06/30'/*</END_DATE>*/
-- ;
-- SET @REX_RECEIPT_NOTE_PATTERN = '%' + @REX_RECEIPT_PREFIX + ' ' + @REX_RECEIPT_PATTERN + '%'
-- ;
-- When Uncomment the above, making sure replace the query part with the variables and uncomment OPTION(RECOMPILE) to speed up the query
-- Here I choose static query that prove to be run fastest (considering the speed of replacing variable tags in program )
;
WITH
cte_payments as (
  SELECT
    B1.SERIALNUMBER, B2.DATEOFPAYMENT, B1.PAYMENTAMOUNT, B1.PAYMENTAMOUNTNETT, B1.GSTAMOUNT
    , S1.SOURCETYPE
    , LTRIM(RTRIM(ISNULL(B2.MANUALRECEIPTNO, ''))) AS [MANUALRECEIPTNO]
    , CASE WHEN LTRIM(RTRIM(B2.MANUALRECEIPTNO)) LIKE '[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
      THEN LTRIM(RTRIM(B2.MANUALRECEIPTNO))
      ELSE
        CASE WHEN B2.NOTES IS NOT NULL AND B2.NOTES LIKE '%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
        THEN SUBSTRING(B2.NOTES, PATINDEX('%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%', B2.NOTES) + LEN('REX Order Number:') + 1, 11)
        ELSE NULL
        END
      END AS [REXORDERID]
    , CONCAT(
        CASE WHEN B2.TITLE IS NULL OR RTRIM(B2.TITLE)='' THEN '' ELSE RTRIM(B2.TITLE) + ' ' END
      , CASE WHEN B2.FIRSTNAME IS NULL OR LTRIM(RTRIM(B2.FIRSTNAME)) IN ('','-','_','.') THEN '' ELSE RTRIM(B2.FIRSTNAME) + ' ' END
      , CASE WHEN B2.KEYNAME IS NULL OR LTRIM(RTRIM(B2.KEYNAME)) IN ('','-','_','.') THEN '' ELSE RTRIM(B2.KEYNAME) END
      ) AS [FULLNAME]

    , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' THEN B3.PLEDGEID ELSE NULL END AS [PLEDGEID]
  FROM
    TBL_BATCHITEMSPLIT        B1
    LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
    LEFT JOIN TBL_BATCHITEMPLEDGE B3 ON (B1.SERIALNUMBER = B3.SERIALNUMBER) AND (B1.RECEIPTNO = B3.RECEIPTNO) AND (B1.ADMITNAME = B3.ADMITNAME) AND (B1.LINEID = B3.LINEID)
    LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
    LEFT JOIN TBL_SOURCECODE  S1 ON (B1.SOURCECODE = S1.SOURCECODE)
  WHERE
    (B2.REVERSED IS NULL OR NOT (B2.REVERSED=1 OR B2.REVERSED=-1)) -- Full reversal and re-entry should be excluded all time
    AND (B4.STAGE ='Batch Approved')
    AND B2.DATEOFPAYMENT BETWEEN @DATE1 AND @DATE2
)
-- --------------------------------------------------------------
,cte_first_date as (
  SELECT SERIALNUMBER, MIN(DATEOFPAYMENT) AS [FIRSTDATE]
  FROM TBL_BATCHITEM
  WHERE (REVERSED IS NULL OR REVERSED NOT IN (-1, 1, 2))
  GROUP BY SERIALNUMBER
  HAVING MIN(DATEOFPAYMENT) BETWEEN @DATE1 AND @DATE2
)
-- --------------------------------------------------------------
,cte_onboard_last as (
   -- The reason of not using aggregating function is all values from the same record are needed not individual aggreation
  SELECT * FROM
  (
    SELECT [SERIALNUMBER],[PARAMETERNAME],[PARAMETERVALUE],[EFFECTIVEFROM],[EFFECTIVETO],[PARAMETERNOTE]
    , [BOARDEDBY] = [CREATEDBY]
    , [BOARDEDCANCALLED] = CASE WHEN [EFFECTIVETO] IS NOT NULL AND [EFFECTIVEFROM]=[EFFECTIVETO] THEN -1 ELSE 0 END
    , ROW_NUMBER() OVER(PARTITION BY SERIALNUMBER ORDER BY CREATED DESC) AS [ROW]
    FROM TBL_CONTACTPARAMETER
    WHERE PARAMETERNAME = 'Merch Onboarding'
  ) tmp
  WHERE ROW =1
)
-- --------------------------------------------------------------
,cte_courtesy_call_last as (
   -- The reason of not using aggregating function is all values from the same record are needed not individual aggreation
  SELECT * FROM
  (
    SELECT [SERIALNUMBER]
    , [COURTESYCALL_TYPE] = [COMMUNICATIONTYPE]
    , [COURTESYCALL_SUBJECT] = [SUBJECT]
    , [COURTESYCALL_NOTES] = [NOTES]
    , [CALLEDBY] = [CREATEDBY]
    , [CALLED] = [CREATED]
    , ROW_NUMBER() OVER(PARTITION BY SERIALNUMBER ORDER BY CREATED DESC) AS [ROW]
    FROM TBL_COMMUNICATION
    WHERE [CATEGORY] = 'Merch Onboarding' AND [SUBJECT] LIKE '%Court%sy%call%1%'
  ) tmp
  WHERE ROW =1
)
-- --------------------------------------------------------------
-- Null Value Will be eliminated from aggregation functions
-- --------------------------------------------------------------
select
  t1.SERIALNUMBER ,[FIRSTDATE] = MIN(t1.FIRSTDATE)
  --> Payment Information
  ,[FULLNAME] = MIN(t2.FULLNAME)
  ,[FIRSTORDER] = MIN(t2.REXORDERID)
  ,[FIRST_ORDER_SOURCE] = IIF(MIN(t2.MANUALRECEIPTNO) LIKE '%[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%','Alternative Receipt Number','Notes' )

  ,[FIRSTORDERS] = COUNT(DISTINCT t2.REXORDERID)  -- Null Value Will be eliminated
  ,[FIRSTDATETOTAL] = SUM(t2.PAYMENTAMOUNT)
  ,[FIRSTDATEGST] = SUM(t2.GSTAMOUNT)
  ,[FIRSTDATE_NONMERCHANDISE_TOTAL] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%' THEN 0 ELSE t2.PAYMENTAMOUNT END)
  ,[FIRSTDATE_MERCHANDISE_TOTAL] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%' THEN t2.PAYMENTAMOUNT ELSE 0 END)
  ,[FIRSTDATE_MERCHANDISE_GST] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%' THEN t2.GSTAMOUNT ELSE 0 END)
  ,[FIRSTDATE_MERCHANDISE_PURCHASE] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%Purchase' or t2.SOURCETYPE like 'Merch%Postage' THEN t2.PAYMENTAMOUNTNETT ELSE 0 END)
  ,[FIRSTDATE_MERCHANDISE_PLEDGE] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%Sponsorship' THEN  t2.PAYMENTAMOUNTNETT ELSE 0 END)
  ,[FIRSTDATE_MERCHANDISE_DONATION] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%Donation' THEN  t2.PAYMENTAMOUNTNETT ELSE 0 END)
  ,[FIRSTDATE_MERCHANDISE_GOL] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%Gift%of%love' THEN  t2.PAYMENTAMOUNTNETT ELSE 0 END)
  ,[FIRSTDATE_MERCHANDISE_OTHER] = SUM(
      CASE WHEN t2.SOURCETYPE like 'Merch%' AND not(t2.SOURCETYPE like 'Merch%Purchase' or t2.SOURCETYPE like 'Merch%Postage' or t2.SOURCETYPE like 'Merch%Gift%of%love' or t2.SOURCETYPE like 'Merch%Donation' or t2.SOURCETYPE like 'Merch%Sponsorship')
      THEN t2.PAYMENTAMOUNTNETT ELSE 0 END)
  ,[FIRST_PLEDGEID] = MIN(t2.PLEDGEID)
  ,[PLEDGES] = COUNT(DISTINCT t2.PLEDGEID)
  --> Merchandise On Boarding Profile
  ,[PARAMETERNAME] = MIN(t3.PARAMETERNAME)
  ,[PARAMETERVALUE] = MIN(t3.PARAMETERVALUE)
  ,[EFFECTIVEFROM] = MIN(t3.EFFECTIVEFROM)
  ,[EFFECTIVETO] = MIN(t3.EFFECTIVETO)
  ,[PARAMETERNOTE] = MIN(t3.PARAMETERNOTE)
  , CASE WHEN MIN(t3.PARAMETERNAME) IS NULL OR RTRIM(MIN(t3.PARAMETERNAME)) = ''
    THEN 0 -- Has no profile
    ELSE
      CASE WHEN CAST(MIN(t3.EFFECTIVEFROM) AS DATE) = CAST(MIN(t3.EFFECTIVETO) AS DATE)
      THEN -2  -- Has profile but cancelled
      ELSE -1  -- Has profile && it's not cancelled
      END
    END AS [BOARDED]
  , [BOARDEDBY] = MIN(t3.BOARDEDBY)
  , [BOARDEDCANCALLED] = MIN(t3.BOARDEDCANCALLED)
  --> Merchandise Communication
  , [CALLEDBY] = MIN(t4.CALLEDBY)
  , [CALLED] = MIN(t4.CALLED)
  , [COURTESYCALL_TYPE]  = MIN(t4.COURTESYCALL_TYPE)
  , [COURTESYCALL_SUBJECT]  = MIN(t4.COURTESYCALL_SUBJECT)
  , [COURTESYCALL_NOTES]  = MIN(t4.COURTESYCALL_NOTES)
  --> Contact Information
  ,[CONTACTTYPE] = MIN(c1.CONTACTTYPE)
  ,[PRIMARYCATEGORY] = MIN(c1.PRIMARYCATEGORY)
  ,[ESTATE] = CASE WHEN MIN(PRIMARYCATEGORY) LIKE '%estate%' THEN -1 ELSE 0 END
  ,[SOURCE] = MIN(c1.SOURCE)

  ,[DONOTMAIL] = CASE WHEN MIN(c1.DONOTMAIL) = -1 THEN -1 ELSE 0 END
  ,[DONOTMAILREASON] = MIN(c1.DONOTMAILREASON)
  ,[DECD] = CASE WHEN MIN(c1.DONOTMAIL) = -1 AND MIN(c1.DONOTMAILREASON) LIKE '%Deceased%' THEN -1 ELSE 0 END
  ,[DONOTCALL] = CASE WHEN MIN(c2.DONOTCALL) = -1 THEN -1 ELSE 0 END

  ,[SORTKEYREFREL2] = MIN(c1.SORTKEYREFREL2)
  ,[SORTKEYREF1] = MIN(c1.SORTKEYREF1)
  ,[SORTKEYREFREL1] = MIN(c1.SORTKEYREFREL1)

  ,[MOBILENUMBER] = MIN(c1.MOBILENUMBER)
  ,[DAYTELEPHONE] = MIN(c1.DAYTELEPHONE)
  ,[EVENINGTELEPHONE] = MIN(c1.EVENINGTELEPHONE)
  ,[FAXNUMBER] = MIN(c1.FAXNUMBER)
  ,[EMAILADDRESS] = MIN(c1.EMAILADDRESS)

from
  cte_first_date t1
  left join cte_payments t2 on (t1.FIRSTDATE = t2.DATEOFPAYMENT and t1.SERIALNUMBER = t2.SERIALNUMBER)
  left join cte_onboard_last t3 on (t1.SERIALNUMBER = t3.SERIALNUMBER)
  left join cte_courtesy_call_last t4 on (t1.SERIALNUMBER = t4.SERIALNUMBER)
  left join TBL_CONTACT C1 on (t1.SERIALNUMBER = c1.SERIALNUMBER)
  left join TBL_CONTACTATTRIBUTE C2 on (t1.SERIALNUMBER = c2.SERIALNUMBER)
where
  (c1.CONTACTTYPE not like 'ADDRESS')
group by
  t1.SERIALNUMBER
having
  SUM(CASE WHEN t2.SOURCETYPE LIKE 'Merch%' THEN t2.PAYMENTAMOUNT ELSE 0 END) > 0
-- ----------------------------------
-- OPTION(RECOMPILE)