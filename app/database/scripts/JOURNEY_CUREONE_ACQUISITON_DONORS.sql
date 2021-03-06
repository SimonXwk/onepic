DECLARE
  @CAMPAIGNCODE VARCHAR (30) = /*<CAMPAIGN_CODE>*/'%19AC.Cure One Acquisition%'/*</CAMPAIGN_CODE>*/,
  @DATE1 VARCHAR (10) = /*<PAYMENT_DATE1>*/'2018/07/01'/*</PAYMENT_DATE1>*/,
  @DATE2 VARCHAR (10) = /*<PAYMENT_DATE2>*/'2019/06/30'/*</PAYMENT_DATE2>*/;
-- --------------------------------------------------------------
;WITH
cte_payments as (
  SELECT
    B1.SERIALNUMBER, B2.DATEOFPAYMENT, B1.PAYMENTAMOUNT, B1.PAYMENTAMOUNTNETT, B1.GSTAMOUNT
    , S1.SOURCETYPE
    , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' THEN B3.PLEDGEID ELSE NULL END AS [PLEDGEID]
    , CASE WHEN S1.SOURCETYPE LIKE 'Merch%' THEN B2.DATEOFPAYMENT ELSE NULL END AS [MERCHANDISE_DATEOFPAYMENT]
    , CASE WHEN S1.ADDITIONALCODE3 LIKE @CAMPAIGNCODE THEN B1.PAYMENTAMOUNT ELSE 0 END AS [CAMPAIGN_PAYMENTAMOUNT]
    , CASE WHEN S1.ADDITIONALCODE3 LIKE @CAMPAIGNCODE AND (B2.REVERSED IS NULL OR NOT (B2.REVERSED IN (1, -1, 2))) THEN B2.DATEOFPAYMENT ELSE NULL END AS [CAMPAIGN_DATEOFPAYMENT]
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
  SELECT SERIALNUMBER
  FROM
    TBL_BATCHITEMSPLIT
    LEFT JOIN TBL_SOURCECODE ON (TBL_BATCHITEMSPLIT.SOURCECODE = TBL_SOURCECODE.SOURCECODE)
    LEFT JOIN TBL_BATCHHEADER ON (TBL_BATCHITEMSPLIT.ADMITNAME = TBL_BATCHHEADER.ADMITNAME)
  WHERE TBL_SOURCECODE.ADDITIONALCODE3 LIKE @CAMPAIGNCODE
     AND (TBL_BATCHHEADER.STAGE ='Batch Approved')
  GROUP BY SERIALNUMBER
)
-- --------------------------------------------------------------
,cte_first_date as (
  SELECT SERIALNUMBER, MIN(DATEOFPAYMENT) AS [FIRSTDATE]
  FROM TBL_BATCHITEM
  WHERE (REVERSED IS NULL OR REVERSED NOT IN (-1, 1, 2))
  GROUP BY SERIALNUMBER
)
-- --------------------------------------------------------------
,cte_conversion_pack_last as (
   -- The reason of not using aggregating function is all values from the same record are needed not individual aggreation
  SELECT * FROM
  (
    SELECT [SERIALNUMBER]
    , [CONVERSIONCALL_TYPE] = [COMMUNICATIONTYPE]
    , [CONVERSIONCALL_SUBJECT] = [SUBJECT]
    , [CONVERSIONCALL_NOTES] = [NOTES]
    , [CONVERSIONCALL_BY] = [CREATEDBY]
    , [CONVERSIONCALL_DATE] = [DATEOFCOMMUNICATION]
    , ROW_NUMBER() OVER(PARTITION BY SERIALNUMBER ORDER BY CREATED DESC) AS [ROW]
    FROM TBL_COMMUNICATION
    WHERE [CATEGORY] = 'Cure One Acquisition' AND [SUBJECT] LIKE '%conversion%'
  ) tmp
  WHERE ROW =1
)
-- --------------------------------------------------------------
,cte_followup_call1_last as (
   -- The reason of not using aggregating function is all values from the same record are needed not individual aggreation
  SELECT * FROM
  (
    SELECT [SERIALNUMBER]
    , [FOLLOWUP1_TYPE] = [COMMUNICATIONTYPE]
    , [FOLLOWUP1_SUBJECT] = [SUBJECT]
    , [FOLLOWUP1_NOTES] = [NOTES]
    , [FOLLOWUP1_BY] = [CREATEDBY]
    , [FOLLOWUP1_DATE] = [DATEOFCOMMUNICATION]
    , ROW_NUMBER() OVER(PARTITION BY SERIALNUMBER ORDER BY CREATED DESC) AS [ROW]
    FROM TBL_COMMUNICATION
    WHERE [CATEGORY] = 'Cure One Acquisition' AND [SUBJECT] LIKE '%Follow%up%1%'
  ) tmp
  WHERE ROW =1
)
-- --------------------------------------------------------------
,cte_followup_call2_last as (
   -- The reason of not using aggregating function is all values from the same record are needed not individual aggreation
  SELECT * FROM
  (
    SELECT [SERIALNUMBER]
    , [FOLLOWUP2_TYPE] = [COMMUNICATIONTYPE]
    , [FOLLOWUP2_SUBJECT] = [SUBJECT]
    , [FOLLOWUP2_NOTES] = [NOTES]
    , [FOLLOWUP2_BY] = [CREATEDBY]
    , [FOLLOWUP2_DATE] = [DATEOFCOMMUNICATION]
    , ROW_NUMBER() OVER(PARTITION BY SERIALNUMBER ORDER BY CREATED DESC) AS [ROW]
    FROM TBL_COMMUNICATION
    WHERE [CATEGORY] = 'Cure One Acquisition' AND [SUBJECT] LIKE '%Follow%up%2%'
  ) tmp
  WHERE ROW =1
)
-- --------------------------------------------------------------
,cte_mail_porfile as (
  SELECT *
  FROM
  (
    SELECT [SERIALNUMBER], [SERIALNUMBER] AS [SN], [PARAMETERVALUE]
    FROM TBL_CONTACTPARAMETER
    WHERE
      ([PARAMETERNAME] = 'Magazine' AND [PARAMETERVALUE] IN ('Action Update B', 'Action Update B Email' , 'Action Update A', 'Action Update A Email', 'Action A', 'Action A Email', 'Action B', 'Action B Email'))
      OR ([PARAMETERNAME] = 'Mailings' AND [PARAMETERVALUE] = 'No Extra Mail')
      OR ([PARAMETERNAME] = 'Appeals' AND [PARAMETERVALUE] IN ('No Extra Appeals', 'No Appeals'))
      OR ([PARAMETERNAME] = 'Catalogue' AND [PARAMETERVALUE] = 'No Catalogue')
  ) D
  PIVOT
  (
    COUNT([SN])
    FOR [PARAMETERVALUE] IN (
      [Action Update B], [Action Update B Email] , [Action Update A], [Action Update A Email], [Action A], [Action A Email], [Action B], [Action B Email]
      ,[No Extra Mail], [No Appeals], [No Extra Appeals], [No Catalogue]
    )
  ) P
)
-- --------------------------------------------------------------
,cte_journey_profile_last as (
  -- The reason of not using aggregating function is all values from the same record are needed not individual aggreation
  SELECT * FROM
  (
    SELECT [SERIALNUMBER],[PARAMETERNAME],[PARAMETERVALUE],[EFFECTIVEFROM],[EFFECTIVETO],[PARAMETERNOTE]
    , [JOURNEY_BY] = [CREATEDBY]
    , [JOURNEY_MODIFIED_BY] = [MODIFIEDBY]
    , ROW_NUMBER() OVER(PARTITION BY SERIALNUMBER ORDER BY CREATED DESC) AS [ROW]
    FROM TBL_CONTACTPARAMETER
    WHERE PARAMETERNAME = 'Cure One Acquisition'
  ) tmp
  WHERE ROW =1
)
-- --------------------------------------------------------------
-- Null Value Will be eliminated from aggregation functions
-- --------------------------------------------------------------
select
  t1.SERIALNUMBER
  --> FIRST DATE
  ,[FIRSTDATE] = MIN(t4.FIRSTDATE)
  ,[FIRSTFY] = YEAR(MIN(t4.FIRSTDATE)) + CASE WHEN MONTH(MIN(t4.FIRSTDATE)) < 7 THEN 0 ELSE 1 END
  ,[CFY] = YEAR(CURRENT_TIMESTAMP ) + CASE WHEN MONTH(CURRENT_TIMESTAMP ) < 7 THEN 0 ELSE 1 END
  --> PAYMENT INFORMATION
  ,[IS_ACQUISITION] = CASE WHEN MIN(t4.FIRSTDATE) = MIN(t2.CAMPAIGN_DATEOFPAYMENT) THEN -1 ELSE 0 END
  ,[FIRST_PLEDGEID] = MIN(t2.PLEDGEID)
  ,[PLEDGES] = COUNT(DISTINCT t2.PLEDGEID)
  ,[CAMPAIGN_FIRSTDATE] = MIN(t2.CAMPAIGN_DATEOFPAYMENT)
  ,[CAMPAIGN_TOAL] = SUM(t2.CAMPAIGN_PAYMENTAMOUNT)
  ,[LTD_TOTAL] = SUM(t2.PAYMENTAMOUNT)
  ,[LTD_MERCHANDISE_TOTAL] = SUM(CASE WHEN t2.SOURCETYPE like 'Merch%' THEN t2.PAYMENTAMOUNT ELSE 0 END)
  ,[LTD_FISET_MERCHANDISE_DATE] = MIN(t2.MERCHANDISE_DATEOFPAYMENT)

  --> Journey Profile
  ,[JOURNEY_NAME] = MIN(t3.PARAMETERNAME)
  ,[JOURNEY_VALUE] = MIN(t3.PARAMETERVALUE)
  ,[JOURNEY_FROM] = MIN(t3.EFFECTIVEFROM)
  ,[JOURNEY_TO] = MIN(t3.EFFECTIVETO)
  ,[JOURNEY_NOTE] = MIN(t3.PARAMETERNOTE)
  , CASE WHEN MIN(t3.PARAMETERNAME) IS NULL OR RTRIM(MIN(t3.PARAMETERNAME)) = ''
    THEN 0 -- Has no profile
    ELSE
      CASE WHEN CAST(MIN(t3.EFFECTIVEFROM) AS DATE) = CAST(MIN(t3.EFFECTIVETO) AS DATE)
      THEN -2  -- Has profile but cancelled
      ELSE -1  -- Has profile && it's not cancelled
      END
    END AS [BOARDED]
  ,[JOURNEY_BY] = MIN(t3.JOURNEY_BY)
  ,[JOURNEY_MODIFIED_BY] = MIN(t3.JOURNEY_MODIFIED_BY)

  --> Conversion Call
  ,[CONVERSIONCALL_BY] = MIN(t5.CONVERSIONCALL_BY)
  ,[CONVERSIONCALL_DATE] = MIN(t5.CONVERSIONCALL_DATE)
  ,[CONVERSIONCALL_TYPE]  = MIN(t5.CONVERSIONCALL_TYPE)
  ,[CONVERSIONCALL_SUBJECT]  = MIN(t5.CONVERSIONCALL_SUBJECT)
  ,[CONVERSIONCALL_NOTES]  = MIN(t5.CONVERSIONCALL_NOTES)

  --> Follow Up Call1
  ,[FOLLOWUP1_BY] = MIN(t6.FOLLOWUP1_BY)
  ,[FOLLOWUP1_DATE] = MIN(t6.FOLLOWUP1_DATE)
  ,[FOLLOWUP1_TYPE]  = MIN(t6.FOLLOWUP1_TYPE)
  ,[FOLLOWUP1_SUBJECT]  = MIN(t6.FOLLOWUP1_SUBJECT)
  ,[FOLLOWUP1_NOTES]  = MIN(t6.FOLLOWUP1_NOTES)

  --> Follow Up Call1
  ,[FOLLOWUP2_BY] = MIN(t7.FOLLOWUP2_BY)
  ,[FOLLOWUP2_DATE] = MIN(t7.FOLLOWUP2_DATE)
  ,[FOLLOWUP2_TYPE]  = MIN(t7.FOLLOWUP2_TYPE)
  ,[FOLLOWUP2_SUBJECT]  = MIN(t7.FOLLOWUP2_SUBJECT)
  ,[FOLLOWUP2_NOTES]  = MIN(t7.FOLLOWUP2_NOTES)

  --> Mailing Profile
  ,[ACTION_B_UPDATE] = ISNULL(MAX(mp1.[Action Update B]), 0)
  ,[ACTION_A_UPDATE] = ISNULL(MAX(mp1.[Action Update A]), 0)
  ,[ACTION_A] = ISNULL(MAX(mp1.[Action A]), 0)
  ,[ACTION_B] = ISNULL(MAX(mp1.[Action B]), 0)

  ,[EACTION_B_UPDATE] = ISNULL(MAX(mp1.[Action Update B Email]), 0)
  ,[EACTION_A_UPDATE] = ISNULL(MAX(mp1.[Action Update A Email]), 0)
  ,[EACTION_A] = ISNULL(MAX(mp1.[Action A Email]), 0)
  ,[EACTION_B] = ISNULL(MAX(mp1.[Action B Email]), 0)

  ,[NO_EXTRA_MAIL] = ISNULL(MAX(mp1.[No Extra Mail]), 0)
  ,[NO_APPEALS] = ISNULL(MAX(mp1.[No Appeals]), 0)
  ,[NO_EXTRA_APPEALS] = ISNULL(MAX(mp1.[No Extra Appeals]), 0)
  ,[NO_CATALOGUE] = ISNULL(MAX(mp1.[No Catalogue]), 0)

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

  ,[MOBILENUMBER] = CASE WHEN RTRIM(MIN(c1.MOBILENUMBER)) = '' THEN NULL ELSE RTRIM(MIN(c1.MOBILENUMBER)) END
  ,[DAYTELEPHONE] = CASE WHEN RTRIM(MIN(c1.DAYTELEPHONE)) = '' THEN NULL ELSE RTRIM(MIN(c1.DAYTELEPHONE)) END
  ,[EVENINGTELEPHONE] = CASE WHEN RTRIM(MIN(c1.EVENINGTELEPHONE)) = '' THEN NULL ELSE RTRIM(MIN(c1.EVENINGTELEPHONE)) END
  ,[FAXNUMBER] = CASE WHEN RTRIM(MIN(c1.FAXNUMBER)) = '' THEN NULL ELSE RTRIM(MIN(c1.FAXNUMBER)) END
  ,[EMAILADDRESS] = CASE WHEN RTRIM(MIN(c1.EMAILADDRESS)) = '' THEN NULL ELSE RTRIM(MIN(c1.EMAILADDRESS)) END
from
  cte_target_contacts t1
  left join cte_payments t2 on (t1.SERIALNUMBER = t2.SERIALNUMBER)
  left join cte_journey_profile_last t3 on (t1.SERIALNUMBER = t3.SERIALNUMBER)
  left join cte_first_date t4 on (t1.SERIALNUMBER = t4.SERIALNUMBER)
  left join cte_conversion_pack_last t5 on (t1.SERIALNUMBER = t5.SERIALNUMBER)
  left join cte_followup_call1_last t6 on (t1.SERIALNUMBER = t6.SERIALNUMBER)
  left join cte_followup_call2_last t7 on (t1.SERIALNUMBER = t7.SERIALNUMBER)
  left join TBL_CONTACT c1 on (t1.SERIALNUMBER = c1.SERIALNUMBER)
  left join TBL_CONTACTATTRIBUTE c2 on (t1.SERIALNUMBER = c2.SERIALNUMBER)
  left join cte_mail_porfile mp1 on (t1.SERIALNUMBER = mp1.SERIALNUMBER)
where
  (c1.CONTACTTYPE not like 'ADDRESS')
group by
  t1.SERIALNUMBER
order by
  min(t2.CAMPAIGN_DATEOFPAYMENT) asc
-- ----------------------------------
-- OPTION(RECOMPILE)