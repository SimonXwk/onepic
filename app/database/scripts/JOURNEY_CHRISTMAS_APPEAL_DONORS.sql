DECLARE
  @CAMPAIGNCODE1 VARCHAR (30) = /*<CAMPAIGN_CODE1>*/'%19DV.October Appeal%'/*</CAMPAIGN_CODE1>*/,
  @CAMPAIGNCODE2 VARCHAR (30) = /*<CAMPAIGN_CODE2>*/'%19DV.August Appeal%'/*</CAMPAIGN_CODE2>*/,
  @SOURCECODE1 VARCHAR (30) = /*<CAMPAIGN_CODE2>*/'19ACTIONUB'/*</CAMPAIGN_CODE2>*/;
-- --------------------------------------------------------------
;WITH
cte_payments as (
  SELECT
    B1.SERIALNUMBER, B2.DATEOFPAYMENT, B1.PAYMENTAMOUNT, B1.PAYMENTAMOUNTNETT, B1.GSTAMOUNT
    , S1.SOURCETYPE
    , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' THEN B3.PLEDGEID ELSE NULL END AS [PLEDGEID]
    , CASE WHEN S1.SOURCETYPE LIKE 'Merch%' THEN B2.DATEOFPAYMENT ELSE NULL END AS [MERCHANDISE_DATEOFPAYMENT]
    , CASE WHEN S1.ADDITIONALCODE3 LIKE @CAMPAIGNCODE1 OR S1.ADDITIONALCODE3 LIKE @CAMPAIGNCODE2 OR B1.SOURCECODE = @SOURCECODE1
      THEN B1.PAYMENTAMOUNT
      ELSE 0
      END AS [CAMPAIGN_PAYMENTAMOUNT]
    , CASE WHEN (S1.ADDITIONALCODE3 LIKE @CAMPAIGNCODE1 OR S1.ADDITIONALCODE3 LIKE @CAMPAIGNCODE2 OR B1.SOURCECODE = @SOURCECODE1) AND (B2.REVERSED IS NULL OR NOT (B2.REVERSED IN (1, -1, 2)))
      THEN B2.DATEOFPAYMENT
      ELSE NULL
      END AS [CAMPAIGN_DATEOFPAYMENT]
  FROM
    TBL_BATCHITEMSPLIT        B1
    LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
    LEFT JOIN TBL_BATCHITEMPLEDGE B3 ON (B1.SERIALNUMBER = B3.SERIALNUMBER) AND (B1.RECEIPTNO = B3.RECEIPTNO) AND (B1.ADMITNAME = B3.ADMITNAME) AND (B1.LINEID = B3.LINEID)
    LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
    LEFT JOIN TBL_SOURCECODE  S1 ON (B1.SOURCECODE = S1.SOURCECODE)
  WHERE
    (B2.REVERSED IS NULL OR NOT (B2.REVERSED=1 OR B2.REVERSED=-1)) -- Full reversal and re-entry should be excluded all time
    AND (B4.STAGE ='Batch Approved')
)
-- --------------------------------------------------------------
,cte_target_contacts as (
  SELECT TBL_BATCHITEMSPLIT.SERIALNUMBER
  FROM
    TBL_BATCHITEMSPLIT
    LEFT JOIN TBL_BATCHITEM ON (TBL_BATCHITEMSPLIT.SERIALNUMBER = TBL_BATCHITEM.SERIALNUMBER) AND (TBL_BATCHITEMSPLIT.RECEIPTNO = TBL_BATCHITEM.RECEIPTNO) AND (TBL_BATCHITEMSPLIT.ADMITNAME = TBL_BATCHITEM.ADMITNAME)
    LEFT JOIN TBL_SOURCECODE ON (TBL_BATCHITEMSPLIT.SOURCECODE = TBL_SOURCECODE.SOURCECODE)
    LEFT JOIN TBL_BATCHHEADER ON (TBL_BATCHITEMSPLIT.ADMITNAME = TBL_BATCHHEADER.ADMITNAME)
  WHERE
    (TBL_BATCHHEADER.STAGE ='Batch Approved')
    AND  (TBL_BATCHITEM.REVERSED IS NULL OR NOT (TBL_BATCHITEM.REVERSED IN (1, -1, 2)))
    AND (
      TBL_SOURCECODE.ADDITIONALCODE3 LIKE @CAMPAIGNCODE1
      OR TBL_SOURCECODE.ADDITIONALCODE3 LIKE @CAMPAIGNCODE1
      OR TBL_BATCHITEMSPLIT.SOURCECODE = @SOURCECODE1
    )
  GROUP BY TBL_BATCHITEMSPLIT.SERIALNUMBER
)
-- --------------------------------------------------------------
,cte_first_date as (
  SELECT SERIALNUMBER, MIN(DATEOFPAYMENT) AS [FIRSTDATE]
  FROM TBL_BATCHITEM
  WHERE (REVERSED IS NULL OR REVERSED NOT IN (-1, 1, 2))
  GROUP BY SERIALNUMBER
)
-- --------------------------------------------------------------
,cte_thank_you_call_last as (
   -- The reason of not using aggregating function is all values from the same record are needed not individual aggreation
  SELECT * FROM
  (
    SELECT [SERIALNUMBER]
    , [THANKYOUCALL_TYPE] = [COMMUNICATIONTYPE]
    , [THANKYOUCALL_SUBJECT] = [SUBJECT]
    , [THANKYOUCALL_NOTES] = [NOTES]
    , [THANKYOUCALL_BY] = [CREATEDBY]
    , [THANKYOUCALL_DATE] = [CREATED]
    , ROW_NUMBER() OVER(PARTITION BY SERIALNUMBER ORDER BY CREATED DESC) AS [ROW]
    FROM TBL_COMMUNICATION
    WHERE [CATEGORY] = 'Thank You'
--       AND [SUBJECT] LIKE '%DEC 2018 THANK YOU%'
  ) tmp
  WHERE ROW =1
)
-- --------------------------------------------------------------
-- Null Value Will be eliminated from aggregation functions
-- --------------------------------------------------------------
select
  t1.SERIALNUMBER
  ,[CFY] = YEAR(CURRENT_TIMESTAMP ) + CASE WHEN MONTH(CURRENT_TIMESTAMP ) < 7 THEN 0 ELSE 1 END
  --> FIRST DATE
  ,[FIRSTDATE] = MIN(t4.FIRSTDATE)
  ,[FIRSTFY] = YEAR(MIN(t4.FIRSTDATE)) + CASE WHEN MONTH(MIN(t4.FIRSTDATE)) < 7 THEN 0 ELSE 1 END
  --> PAYMENT INFORMATION
  ,[IS_ACQUISITION] = CASE WHEN MIN(t4.FIRSTDATE) = MIN(t2.CAMPAIGN_DATEOFPAYMENT) THEN -1 ELSE 0 END
  ,[CAMPAIGN_FIRSTDATE] = MIN(t2.CAMPAIGN_DATEOFPAYMENT)
  ,[CAMPAIGN_LASTDATE] = MAX(t2.CAMPAIGN_DATEOFPAYMENT)
  ,[CAMPAIGN_LIFESPAN] = DATEDIFF(d, MIN(t2.CAMPAIGN_DATEOFPAYMENT), MAX(t2.CAMPAIGN_DATEOFPAYMENT))
  ,[CAMPAIGN_TOAL] = SUM(t2.CAMPAIGN_PAYMENTAMOUNT)
  ,[LTD_TOTAL] = SUM(t2.PAYMENTAMOUNT)
--   ,[LTD_MERCHANDISE_TOTAL] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%' THEN t2.PAYMENTAMOUNT ELSE 0 END)
--   ,[LTD_FISET_MERCHANDISE_DATE] = MIN(t2.MERCHANDISE_DATEOFPAYMENT)
--
--
  --> Thank You Call
  ,[THANKYOUCALL_BY] = MIN(t5.THANKYOUCALL_BY)
  ,[THANKYOUCALL_DATE] = MIN(t5.THANKYOUCALL_DATE)
  ,[THANKYOUCALL_TYPE]  = MIN(t5.THANKYOUCALL_TYPE)
  ,[THANKYOUCALL_SUBJECT]  = MIN(t5.THANKYOUCALL_SUBJECT)
  ,[THANKYOUCALL_NOTES]  = MIN(t5.THANKYOUCALL_NOTES)

   --> Contact Information
  , CONCAT(
        CASE WHEN MIN(c1.TITLE) IS NULL OR RTRIM(MIN(c1.TITLE))='' THEN '' ELSE RTRIM(MIN(c1.TITLE)) + ' ' END
      , CASE WHEN MIN(c1.FIRSTNAME) IS NULL OR LTRIM(RTRIM(MIN(c1.FIRSTNAME))) IN ('','-','_','.') THEN '' ELSE RTRIM(MIN(c1.FIRSTNAME)) + ' ' END
      , CASE WHEN MIN(c1.OTHERINITIAL) IS NULL OR LTRIM(RTRIM(MIN(c1.OTHERINITIAL))) IN ('','-','_','.') THEN '' ELSE RTRIM(MIN(c1.OTHERINITIAL)) + ' ' END
      , CASE WHEN MIN(c1.KEYNAME) IS NULL OR LTRIM(RTRIM(MIN(c1.KEYNAME))) IN ('','-','_','.') THEN '' ELSE RTRIM(MIN(c1.KEYNAME)) END
    ) AS [FULLNAME]
  ,[CONTACTTYPE] = MIN(c1.CONTACTTYPE)
  ,[PRIMARYCATEGORY] = MIN(c1.PRIMARYCATEGORY)
  ,[SOURCE] = MIN(c1.SOURCE)
  ,[STATE] = MIN(c1.ADDRESSLINE4)
  ,[POSTCODE] = MIN(c1.POSTCODE)
  ,[ESTATE] = CASE WHEN MIN(PRIMARYCATEGORY) LIKE '%estate%' THEN -1 ELSE 0 END
  ,[DONOTMAIL] = CASE WHEN MIN(c1.DONOTMAIL) = -1 THEN -1 ELSE 0 END
  ,[DONOTMAILREASON] = MIN(c1.DONOTMAILREASON)
  ,[DECD] = CASE WHEN MIN(c1.DONOTMAIL) = -1 AND MIN(c1.DONOTMAILREASON) LIKE '%Deceased%' THEN -1 ELSE 0 END
  ,[ANONYMOUS] = CASE WHEN MIN(c1.ANONYMOUS) = -1 THEN -1 ELSE 0 END
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
  cte_target_contacts t1
  left join cte_payments t2 on (t1.SERIALNUMBER = t2.SERIALNUMBER)
  left join cte_first_date t4 on (t1.SERIALNUMBER = t4.SERIALNUMBER)
  left join cte_thank_you_call_last t5 on (t1.SERIALNUMBER = t5.SERIALNUMBER)
  left join TBL_CONTACT c1 on (t1.SERIALNUMBER = c1.SERIALNUMBER)
  left join TBL_CONTACTATTRIBUTE c2 on (t1.SERIALNUMBER = c2.SERIALNUMBER)
where
  (c1.CONTACTTYPE not like 'ADDRESS')
group by
  t1.SERIALNUMBER
order by
  min(t2.CAMPAIGN_DATEOFPAYMENT) asc


-- ----------------------------------
-- OPTION(RECOMPILE)
-- ----------------------------------