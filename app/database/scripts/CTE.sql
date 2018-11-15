-- ----------------------------------------------------------------------------------------------------
DECLARE
    @PAYMENT_DATE1 VARCHAR (10) = /*<PAYMENT_DATE1>*/DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP) + CASE WHEN MONTH(CURRENT_TIMESTAMP)>7 THEN 0 ELSE -1 END,7,1)/*</PAYMENT_DATE1>*/
  , @PAYMENT_DATE2 VARCHAR (10) = /*<PAYMENT_DATE2>*/DATEFROMPARTS(YEAR(CURRENT_TIMESTAMP) + CASE WHEN MONTH(CURRENT_TIMESTAMP)>7 THEN 1 ELSE 0 END,6,30)/*</PAYMENT_DATE2>*/
  , @TLC AS VARCHAR(5) = 'TLC'
  , @AP AS VARCHAR(20) = 'ACTION PARTNER'
  , @CUREONE AS VARCHAR(10) = 'CURE ONE'
  , @CS AS VARCHAR(20) = 'COUNTRY SUPPORT'
  , @PS AS VARCHAR(20) = 'PERSONAL SUPPORT'
  , @UNDEF AS VARCHAR(15) = 'UNCATEGORIZED'
  , @BLANK AS VARCHAR(7) =/*<BLANK_STR>*/NULL/*</BLANK_STR>*/
  ;
-- ----------------------------------------------------------------------------------------------------
WITH
-- ----------------------------------------------------------------------------------------------------
cte_decimal AS (SELECT * FROM (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) AS numbers(X))
-- ----------------------------------------------------------------------------------------------------

-- ====================================================================================================
-- PLEDGES
-- ====================================================================================================
, cte_pledge_types as (
  SELECT [SOURCECODE]
  ,[PLEDGE_CATEGORY] =
    CASE WHEN SOURCECODE = 'TLCSPON'
      THEN @TLC ELSE
    CASE WHEN SOURCECODE IN ('SACTIONP','ACTCRA','ACTCRM','SCEDU')
      THEN @AP ELSE
    CASE WHEN SOURCECODE = 'SPERSON'
      THEN @PS ELSE
    CASE WHEN SOURCECODE IN ('SCOUNTRY','SPNEPAL','SPNG', 'SNIGER', 'SINDIA', 'STHAIL', 'SNIGERIA', 'SMYANM', 'AETIMO', 'SETIMOR', 'SNIGERIA', 'SCHINA', 'SCONGO')
      THEN @CS ELSE
    CASE WHEN SOURCECODE LIKE '%SCURE%' OR SOURCECODE IN ('CUREONE1', 'CUREONE2')
      THEN @CUREONE ELSE @UNDEF
    END END END END END
  FROM TBL_SOURCECODE
  WHERE SOURCETYPE LIKE '%SPONSORSHIP'
)
-- ----------------------------------------------------------------------------------------------------
, cte_pledge_frequency AS(
  SELECT *
  FROM (VALUES
    ('Tri-Yearly', 1095),
    ('Annually', 365),
    ('Half Yearly', 183),
    ('Quarterly', 90),
    ('Monthly', 30),
    ('Four-Weekly', 28),
    ('Bi-Monthly', 15),
    ('Fortnightly', 14),
    ('Weekly', 7),
    ('One Off', 1)
  ) AS frequency(PAYMENTFREQUENCY, DAYS)
)
-- ----------------------------------------------------------------------------------------------------
, cte_pledge_source as (
  SELECT TBL_PLEDGEDESTINATION.[PLEDGEID]
    ,[SOURCETYPE] = MIN(TBL_SOURCECODE.SOURCETYPE)
    ,[SOURCECODES] = COUNT(TBL_PLEDGEDESTINATION.SOURCECODE)
    ,[FIRST_SOURCECODE1] = IIF(RTRIM(ISNULL(MIN(TBL_PLEDGEDESTINATION.SOURCECODE),''))='', @BLANK, MIN(TBL_PLEDGEDESTINATION.SOURCECODE))
    ,[FIRST_SOURCECODE2] = IIF(RTRIM(ISNULL(MIN(TBL_PLEDGEDESTINATION.SOURCECODE2),''))='', @BLANK, MIN(TBL_PLEDGEDESTINATION.SOURCECODE2))
    ,[FIRST_DESTINATION1] = IIF(RTRIM(ISNULL(MIN(TBL_PLEDGEDESTINATION.DESTINATIONCODE),''))='', @BLANK, MIN(TBL_PLEDGEDESTINATION.DESTINATIONCODE))
    ,[FIRST_DESTINATION2] = IIF(RTRIM(ISNULL(MIN(TBL_PLEDGEDESTINATION.DESTINATIONCODE2),''))='', @BLANK, MIN(TBL_PLEDGEDESTINATION.DESTINATIONCODE2))
  FROM
    TBL_PLEDGEDESTINATION
    LEFT JOIN TBL_SOURCECODE ON (TBL_PLEDGEDESTINATION.SOURCECODE = TBL_SOURCECODE.SOURCECODE)
  GROUP BY PLEDGEID
)
-- ----------------------------------------------------------------------------------------------------
, cte_legit_pledge as (
  SELECT P1.PLEDGEID
    -- Contact Name and Serial Number
    ,P1.SERIALNUMBER
    ,[FULLNAME] = CONCAT(IIF(P1.TITLE IS NULL,'', P1.TITLE + ' '), IIF(P1.FIRSTNAME IS NULL,'', P1.FIRSTNAME + ' '), P1.KEYNAME)
    -- Key Dates ( New, On Hold, WrittenDown )
    ,P1.CREATEDBY, P1.CREATED
    ,P1.STARTDATE, P1.ENDDATE
    ,P1.ONHOLDDATETIME
    ,P1.WRITTENDOWN
    ,[CLOSED] = CASE WHEN P1.PLEDGEPLAN NOT LIKE '%Continuous%' AND RTRIM(P1.PLEDGESTATUS) = 'Closed' THEN P1.ENDDATE ELSE NULL END
    ,[FINISHED] = CASE WHEN P1.PLEDGEPLAN NOT LIKE '%Continuous%' AND RTRIM(P1.PLEDGESTATUS) = 'Closed' THEN P1.NEXTCALLDATE ELSE NULL END

    ,[CREATED_FY] = YEAR(P1.CREATED) + CASE WHEN MONTH(P1.CREATED) < 7 THEN 0 ELSE 1 END
    ,[START_FY] = YEAR(P1.STARTDATE) + CASE WHEN MONTH(P1.STARTDATE) < 7 THEN 0 ELSE 1 END
    ,[END_FY] = YEAR(P1.ENDDATE) + CASE WHEN MONTH(P1.ENDDATE) < 7 THEN 0 ELSE 1 END
    ,[ONHOLD_FY] = YEAR(P1.ONHOLDDATETIME) + CASE WHEN MONTH(P1.ONHOLDDATETIME) < 7 THEN 0 ELSE 1 END
    ,[WRITTENDOWN_FY] = YEAR(P1.WRITTENDOWN) + CASE WHEN MONTH(P1.WRITTENDOWN) < 7 THEN 0 ELSE 1 END
    ,[CLOSED_FY] =
        CASE WHEN P1.PLEDGEPLAN NOT LIKE '%Continuous%' AND RTRIM(P1.PLEDGESTATUS) = 'Closed'
        THEN YEAR(P1.ENDDATE) + CASE WHEN MONTH(P1.ENDDATE) < 7 THEN 0 ELSE 1 END
        ELSE NULL
        END
    ,[FINISHED_FY] =
        CASE WHEN P1.PLEDGEPLAN NOT LIKE '%Continuous%' AND RTRIM(P1.PLEDGESTATUS) = 'Closed'
        THEN YEAR(P1.NEXTCALLDATE) + CASE WHEN MONTH(P1.NEXTCALLDATE) < 7 THEN 0 ELSE 1 END
        ELSE NULL
        END

    ,[ONHOLDBY] = CASE WHEN RTRIM(P1.ONHOLDBY) = '' THEN NULL ELSE RTRIM(P1.ONHOLDBY) END
    ,[ONHOLDREASON] = CASE WHEN RTRIM(ISNULL(P1.ONHOLDBY,'')) <> '' AND (RTRIM(P1.ONHOLDREASON) = '' OR P1.ONHOLDREASON IS NULL) THEN @BLANK ELSE RTRIM(P1.ONHOLDREASON) END
    ,[WRITTENDOWNBY] = CASE WHEN RTRIM(P1.WRITTENDOWNBY) = '' THEN NULL ELSE RTRIM(P1.WRITTENDOWNBY) END
    ,[WRITTENDOWNREASON] = CASE WHEN RTRIM(ISNULL(P1.WRITTENDOWNBY,'')) <> '' AND (RTRIM(P1.WRITTENDOWNREASON) = '' OR P1.WRITTENDOWNREASON IS NULL) THEN @BLANK ELSE RTRIM(P1.WRITTENDOWNREASON) END
    -- Campaign Information
    ,[ACQUISITION_CAMPAIGNCODE] = CASE WHEN RTRIM(ISNULL(P1.RECRUITMENTMETHOD,''))='' THEN @BLANK ELSE P1.RECRUITMENTMETHOD END
    ,[ACQUISITION_DETAIL] = CASE WHEN RTRIM(ISNULL(P1.PLEDGERECRUITEDBY,''))=''THEN @BLANK ELSE P1.PLEDGERECRUITEDBY END
    -- Key Data Fields that should not be null or blank
    ,[PLEDGESTATUS] = CASE WHEN RTRIM(ISNULL(P1.PLEDGESTATUS,''))='' THEN @BLANK ELSE P1.PLEDGESTATUS END
    ,[DESCRIPTION] = CASE WHEN RTRIM(ISNULL(P1.DESCRIPTION,''))='' THEN @BLANK ELSE P1.DESCRIPTION END
    ,[PLEDGEPLAN] = CASE WHEN RTRIM(ISNULL(P1.PLEDGEPLAN,''))='' THEN @BLANK ELSE P1.PLEDGEPLAN END
    ,[LIFESPAN] = CASE WHEN RTRIM(ISNULL(P1.PLEDGEPLAN,''))=''
                  THEN @BLANK
                  ELSE CASE WHEN P1.PLEDGEPLAN = 'Continuous' THEN 'Infinite' ELSE 'Finite' END
                  END
    ,[PLEDGETYPE] = CASE WHEN RTRIM(ISNULL(P1.PLEDGETYPE,''))='' THEN @BLANK ELSE P1.PLEDGETYPE END
    ,[PAYMENTFREQUENCY] = CASE WHEN RTRIM(ISNULL(P1.PAYMENTFREQUENCY,''))='' THEN @BLANK ELSE P1.PAYMENTFREQUENCY END
    ,[PAYMENTFREQUENCY_DAYS] = CASE WHEN RTRIM(ISNULL(P1.PAYMENTFREQUENCY,''))='' THEN 0 ELSE FQ.DAYS END
    ,[PAYMENTTYPE] = CASE WHEN P1.PAYMENTTYPE IS NULL OR RTRIM(P1.PAYMENTTYPE)='' THEN @BLANK ELSE P1.PAYMENTTYPE END
    -- Pledge Header Financial (stands alone)
    ,[INSTALMENTVALUE] = ISNULL(P1.INSTALMENTVALUE,0)
    ,[INSTALMENTVALUE_PER_DAY] = CASE WHEN RTRIM(ISNULL(P1.PAYMENTFREQUENCY,''))='' THEN 0 ELSE (ISNULL(P1.INSTALMENTVALUE,0)/FQ.DAYS) END
    ,[TOTALPAID] = ISNULL(P1.TOTALPAID,0)
    -- Credit Card Expiry
    ,[CREDITCARDEXPIRY] = CASE WHEN RTRIM(p1.CREDITCARDEXPIRY) = '' OR p1.CREDITCARDEXPIRY IS NULL THEN NULL ELSE RTRIM(p1.CREDITCARDEXPIRY) END
    -- Source Codes and Destination Codes
    ,P2.SOURCECODES
    ,P2.FIRST_SOURCECODE1, P2.FIRST_SOURCECODE2, P2.FIRST_DESTINATION1, P2.FIRST_DESTINATION2
    -- Pledge Category 1 & 2 plus life time
    ,[SPONSORSHIP1]=PT.PLEDGE_CATEGORY
    ,[SPONSORSHIP2]=IIF(PT.PLEDGE_CATEGORY = @TLC, PT.PLEDGE_CATEGORY,
      IIF(PT.PLEDGE_CATEGORY = @AP, PT.PLEDGE_CATEGORY,
        IIF(PT.PLEDGE_CATEGORY = @PS, CONCAT(PT.PLEDGE_CATEGORY,': ', UPPER(P2.FIRST_DESTINATION2)),
          IIF(PT.PLEDGE_CATEGORY = @CS, CONCAT(PT.PLEDGE_CATEGORY,': ', UPPER(P2.FIRST_DESTINATION1)),
            IIF(PT.PLEDGE_CATEGORY = @CUREONE
            , IIF(P2.FIRST_SOURCECODE1 LIKE '%CURE%R', @CUREONE + ' RENEW', @CUREONE +' ACQUISITION')
            , @UNDEF)
          )
        )
      )
    )
    ,[SPONSORSHIP1_COLOR]=
      CASE WHEN PT.PLEDGE_CATEGORY = @TLC     THEN '#007dc3' ELSE
      CASE WHEN PT.PLEDGE_CATEGORY = @AP      THEN '#fdbb30' ELSE
      CASE WHEN PT.PLEDGE_CATEGORY = @PS      THEN '#a560e8' ELSE
      CASE WHEN PT.PLEDGE_CATEGORY = @CS      THEN '#4dc47d' ELSE
      CASE WHEN PT.PLEDGE_CATEGORY = @CUREONE THEN '#e64b50' ELSE '#b0a696'
      END END END END END
  FROM
    TBL_PLEDGEHEADER P1
    LEFT JOIN cte_pledge_source P2 ON (P1.PLEDGEID=P2.PLEDGEID)
    LEFT JOIN cte_pledge_types PT ON (P2.FIRST_SOURCECODE1=PT.SOURCECODE)
    LEFT JOIN cte_pledge_frequency FQ ON (P1.PAYMENTFREQUENCY=FQ.PAYMENTFREQUENCY)
  WHERE
    P2.SOURCETYPE LIKE '%SPONSORSHIP'
    -- AND (RTRIM(ISNULL(P1.EXTERNALREF,''))='') AND (RTRIM(ISNULL(P1.EXTERNALREFTYPE,''))='')
    -- AND (P1.DESCRIPTION IS NULL OR P1.DESCRIPTION NOT LIKE '%MERCHANDISE%')
)

-- ----------------------------------------------------------------------------------------------------
, cte_pledge_due as (
  SELECT DUE.PLEDGEID
    ,[FIRST_DUE] = MIN(DUE.DATEDUE)
    ,[IS_OVERDUE] = IIF(MIN(DUE.DATEDUE) IS NULL, 1, IIF(MIN(DUE.DATEDUE)<CAST(CURRENT_TIMESTAMP AS DATE), -1, 1))
  FROM TBL_PLEDGEINSTALMENTS_ACTIVE AS DUE
  GROUP BY DUE.PLEDGEID
)
-- ----------------------------------------------------------------------------------------------------
, cte_pledge_paid as (
  SELECT Tbl_PLEDGEINSTALMENTS_CLOSED.PLEDGEID
    ,[LTD_TOTAL] = SUM(Tbl_PLEDGEINSTALMENTS_CLOSED.AMOUNTPAID)
    ,[PAID_INSTALMENTS] = COUNT(DISTINCT Tbl_PLEDGEINSTALMENTS_CLOSED.INSTALMENTID)
  FROM
    Tbl_PLEDGEINSTALMENTS_CLOSED
  GROUP BY
    Tbl_PLEDGEINSTALMENTS_CLOSED.PLEDGEID
)
-- ----------------------------------------------------------------------------------------------------
, cte_pledge as (
  SELECT P1.*
    ,P4.IS_OVERDUE, P4.FIRST_DUE
    ,P3.LTD_TOTAL, P3.PAID_INSTALMENTS
  FROM
    cte_legit_pledge P1
    LEFT JOIN cte_pledge_paid P3 ON (P1.PLEDGEID=P3.PLEDGEID)
    LEFT JOIN cte_pledge_due P4 ON (P1.PLEDGEID=P4.PLEDGEID)
)
-- ----------------------------------------------------------------------------------------------------
, cte_pledge_actual as (
  SELECT
    TBL_BATCHITEMPLEDGE.PLEDGEID
    ,TBL_BATCHITEMPLEDGE.PLEDGELINENO
    ,TBL_BATCHITEMPLEDGE.ADMITNAME, TBL_BATCHITEMPLEDGE.SERIALNUMBER
    ,TBL_BATCHITEM.DATEOFPAYMENT
    ,TBL_SOURCECODE.SOURCETYPE
    ,[ACTUAL_SCOURCE1] = Tbl_BATCHITEMSPLIT.SOURCECODE
    ,[ACTUAL_TOTAL] = SUM(Tbl_BATCHITEMSPLIT.PAYMENTAMOUNT)
    ,TBL_BATCHITEM.REVERSED
  FROM
    TBL_BATCHITEMPLEDGE
    LEFT JOIN TBL_BATCHITEM ON (TBL_BATCHITEMPLEDGE.ADMITNAME = TBL_BATCHITEM.ADMITNAME AND TBL_BATCHITEMPLEDGE.RECEIPTNO = TBL_BATCHITEM.RECEIPTNO AND TBL_BATCHITEMPLEDGE.SERIALNUMBER = TBL_BATCHITEM.SERIALNUMBER)
    LEFT JOIN Tbl_BATCHITEMSPLIT ON (TBL_BATCHITEMPLEDGE.ADMITNAME = Tbl_BATCHITEMSPLIT.ADMITNAME AND TBL_BATCHITEMPLEDGE.RECEIPTNO = Tbl_BATCHITEMSPLIT.RECEIPTNO AND TBL_BATCHITEMPLEDGE.SERIALNUMBER = Tbl_BATCHITEMSPLIT.SERIALNUMBER AND TBL_BATCHITEMPLEDGE.LINEID = Tbl_BATCHITEMSPLIT.LINEID)
    LEFT JOIN Tbl_BATCHHEADER ON (TBL_BATCHITEMPLEDGE.ADMITNAME = Tbl_BATCHHEADER.ADMITNAME)
    LEFT JOIN TBL_SOURCECODE ON (Tbl_BATCHITEMSPLIT.SOURCECODE = TBL_SOURCECODE.SOURCECODE)
  WHERE
    Tbl_BATCHHEADER.STAGE = 'Batch Approved'
    AND TBL_SOURCECODE.SOURCETYPE LIKE '%Sponsorship'
    AND (TBL_BATCHITEM.REVERSED IS NULL OR NOT (TBL_BATCHITEM.REVERSED=1 OR TBL_BATCHITEM.REVERSED=-1))
  GROUP BY
    TBL_BATCHITEMPLEDGE.PLEDGEID,TBL_BATCHITEMPLEDGE.ADMITNAME, TBL_BATCHITEMPLEDGE.SERIALNUMBER,TBL_BATCHITEMPLEDGE.PLEDGELINENO
    ,TBL_BATCHITEM.DATEOFPAYMENT,Tbl_BATCHITEMSPLIT.SOURCECODE,TBL_BATCHITEM.REVERSED
    ,TBL_SOURCECODE.SOURCETYPE
)
-- ====================================================================================================
-- PAYMENTS
-- ====================================================================================================
, cte_market_cycle AS(
  SELECT *
  FROM (VALUES
    (1, 'PP', 'Prospecting'),
    (2, 'AC', 'Acquisition'),
    (3, 'DV', 'Development'),
    (4, 'PM', 'Promotion'),
    (5, 'DF', 'Differentiation'),
    (6, 'RT', 'Retention'),
    (7, 'EG', 'Engagement'),
    (8, 'RN', 'Renewal'),
    (9, 'RA', 'Reactivation'),
    (0, '__', 'TBD'),
    (-1, null, 'UNDEFINED')
  ) AS mc (SEQ, CODE, NAME)
)
-- ----------------------------------------------------------------------------------------------------
, cte_pledge_first_paid_instalment as (
  SELECT PLEDGEID
    ,[FIRST_INSTALMENTID] = MIN(Tbl_PLEDGEINSTALMENTS_CLOSED.INSTALMENTID)
  FROM Tbl_PLEDGEINSTALMENTS_CLOSED
  GROUP BY PLEDGEID
)
-- ----------------------------------------------------------------------------------------------------
,cte_payments AS (
SELECT
  -- >>>> From BATCH_ITEM_SPLIT
  B1.SERIALNUMBER
  , B1.PAYMENTAMOUNT , B1.GSTAMOUNT , B1.PAYMENTAMOUNTNETT
  , B1.SOURCECODE, B1.SOURCECODE2
  , B1.DESTINATIONCODE, B1.DESTINATIONCODE2

  -- >>>> From BATCH_ITEM
--   , B2.ENVELOPESALUTATION
--   , CASE WHEN UPPER(LTRIM(RTRIM(B2.ADDRESSLINE4))) IN ('VIC','NSW','SA','QLD','WA','TAS','ACT','NT')
--     THEN UPPER(LTRIM(RTRIM(B2.ADDRESSLINE4)))
--     ELSE 'OVERSEA'
--     END AS [STATE]
--   , DATEDIFF(d, B2.DATEOFBIRTH, CURRENT_TIMESTAMP )/365 AS [AGE]

  , B2.PAYMENTTYPE
  , B2.DATEOFPAYMENT
  , YEAR(B2.DATEOFPAYMENT) + CASE WHEN MONTH(B2.DATEOFPAYMENT) < 7 THEN 0 ELSE 1 END AS [PAYMENT_FY]
  , MONTH(B2.DATEOFPAYMENT) + CASE WHEN MONTH(B2.DATEOFPAYMENT) < 7 THEN 6 ELSE -6 END AS [PAYMENT_FYMTH]
  , CASE WHEN B2.REVERSED = 2
    THEN 0
    ELSE DENSE_RANK() OVER (PARTITION BY CASE WHEN B2.REVERSED IN (1, -1, 2) THEN 0 ELSE -1 END ORDER BY CONCAT(CONVERT(VARCHAR(10), B2.DATEOFPAYMENT, 112), B2.SERIALNUMBER, B2.ADMITNAME, B2.RECEIPTNO) ASC)
    END AS [TRXID]

  , CASE WHEN B2.REVERSED = 2 OR B2.REVERSED = 1 OR B2.REVERSED = -1 THEN 0 ELSE -1 END AS [ISTRX]

  , CASE WHEN
    ((MONTH(B2.DATEOFPAYMENT) + CASE WHEN MONTH(B2.DATEOFPAYMENT) < 7 THEN 6 ELSE -6 END) * 100 + DAY(B2.DATEOFPAYMENT)) <=
    ((MONTH(CURRENT_TIMESTAMP) + CASE WHEN MONTH(CURRENT_TIMESTAMP) < 7 THEN 6 ELSE -6 END) * 100 + DAY(CURRENT_TIMESTAMP))
    THEN -1
    ELSE 0
    END AS [ISLTD]

  , CASE WHEN LTRIM(RTRIM(B2.MANUALRECEIPTNO)) LIKE '[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    THEN LTRIM(RTRIM(B2.MANUALRECEIPTNO))
    ELSE
      CASE WHEN B2.NOTES IS NOT NULL AND B2.NOTES LIKE '%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
      THEN SUBSTRING(B2.NOTES, PATINDEX('%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%', B2.NOTES) + LEN('REX Order Number:') + 1, 11)
      ELSE NULL
      END
    END AS [REXORDERID]

  -- >>>> From SOURCE_CODE Table
  , CASE WHEN S1.SOURCETYPE LIKE '%Merchandise%'
    THEN 'Merchandise_Platform'
    ELSE 'Non-Merchandise_Platform'
    END AS [PLATFORM]

  , CASE WHEN S1.SOURCETYPE LIKE '%Merchandise%'
    THEN 'Merchandise'
    ELSE
      CASE WHEN S1.SOURCETYPE = 'Bequest'
      THEN 'Bequest'
      ELSE 'Fundraising'
      END
    END AS [MAINSTREAM]
  , S1.SOURCETYPE , S1.ADDITIONALCODE1 AS [ACCOUNT], S1.ADDITIONALCODE5 AS [CLASS]

  -- >>>> From BATCH_ITEM)PLEDGE
  , B3.PLEDGELINENO
  , P2.FIRST_INSTALMENTID
  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL AND B3.PLEDGELINENO = P2.FIRST_INSTALMENTID THEN -1 ELSE 0 END AS [IS_FIRST_INSTALMENT]

  -- >>>> From PLEDGE_HEADER Table
  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' THEN P1.PLEDGEID ELSE NULL END AS [PLEDGEID]
  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL THEN -1 ELSE 0 END AS [ISPLEDGE]


  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL
    THEN
      CASE WHEN B1.SOURCECODE = 'TLCSPON'
        THEN 'TLC' ELSE
      CASE WHEN B1.SOURCECODE IN ('SACTIONP','ACTCRA','ACTCRM','SCEDU')
        THEN 'ACTION PARTNER' ELSE
      CASE WHEN B1.SOURCECODE = 'SPERSON'
        THEN 'PERSONAL SUPPORT' ELSE
      CASE WHEN B1.SOURCECODE IN ('SCOUNTRY','SPNEPAL','SPNG', 'SNIGER', 'SINDIA', 'STHAIL', 'SNIGERIA', 'SMYANM', 'AETIMO', 'SETIMOR', 'SNIGERIA', 'SCHINA', 'SCONGO')
        THEN 'COUNTRY SUPPORT' ELSE
      CASE WHEN B1.SOURCECODE LIKE '%SCURE%' OR B1.SOURCECODE IN ('CUREONE1', 'CUREONE2')
        THEN 'CURE ONE' ELSE 'UNCATEGORIZED'
      END END END END END
    ELSE NULL END AS [PLEDGETYPE1]

  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL
    THEN P1.PLEDGERECRUITEDBY
    ELSE NULL
    END AS [RECRUITMENT]

  -- >>>> From SOURCECODE AND PLEDGE_HEADER Table
  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL
  THEN
    CASE WHEN B3.PLEDGELINENO = P2.FIRST_INSTALMENTID
    THEN
      CASE WHEN P1.RECRUITMENTMETHOD IS NULL OR RTRIM(P1.RECRUITMENTMETHOD) = '' OR P1.RECRUITMENTMETHOD LIKE '%Unsolicited%'
      THEN '____.Unsolicited'
      ELSE P1.RECRUITMENTMETHOD
      END
    ELSE
      CASE WHEN S1.ADDITIONALCODE3 IS NULL OR RTRIM(S1.ADDITIONALCODE3) = '' OR S1.ADDITIONALCODE3 LIKE '%Unsolicited%'
      THEN '____.Unsolicited'
      ELSE S1.ADDITIONALCODE3
      END
    END
  ELSE
    CASE WHEN S1.ADDITIONALCODE3 IS NULL OR RTRIM(S1.ADDITIONALCODE3) = '' OR S1.ADDITIONALCODE3 LIKE '%Unsolicited%'
    THEN '____.Unsolicited'
    ELSE S1.ADDITIONALCODE3
    END
  END AS [MARKETING_ACTIVITY]

  , S1.CATEGORY AS [CAMPAIGN_CODE]

  , FIRST_VALUE(B2.DATEOFPAYMENT) OVER(PARTITION BY B1.SERIALNUMBER ORDER BY B2.DATEOFPAYMENT) AS [THIS_FIRST_DATE]
FROM
  TBL_BATCHITEMSPLIT                            B1
  LEFT OUTER JOIN TBL_BATCHITEM                 B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
  LEFT OUTER JOIN TBL_BATCHITEMPLEDGE           B3 ON (B1.SERIALNUMBER = B3.SERIALNUMBER) AND (B1.RECEIPTNO = B3.RECEIPTNO) AND (B1.ADMITNAME = B3.ADMITNAME) AND (B1.LINEID = B3.LINEID)
  LEFT OUTER JOIN TBL_PLEDGEHEADER              P1 ON (B3.PLEDGEID = P1.PLEDGEID)
  LEFT OUTER JOIN cte_pledge_first_paid_instalment P2 ON (P1.PLEDGEID = P2.PLEDGEID) AND (B3.PLEDGELINENO = P2.FIRST_INSTALMENTID)
  LEFT OUTER JOIN TBL_BATCHHEADER               B4 ON (B2.ADMITNAME = B4.ADMITNAME)
  LEFT OUTER JOIN Tbl_SOURCECODE                S1 ON (B1.SOURCECODE = S1.SOURCECODE)
WHERE
  (B2.REVERSED IS NULL OR NOT(B2.REVERSED IN (1, -1))) AND (B4.STAGE ='Batch Approved')
  AND B2.DATEOFPAYMENT BETWEEN @PAYMENT_DATE1 AND @PAYMENT_DATE2
)
-- ----------------------------------------------------------------------------------------------------
, cte_previous_date AS (
  SELECT B2.SERIALNUMBER
    , MIN(B2.DATEOFPAYMENT) AS [PREVIOUS_FIRST_DATE]
    , MAX(B2.DATEOFPAYMENT) AS [PREVIOUS_LAST_DATE]
    , MAX(CASE WHEN B2.DATEOFPAYMENT < DATEFROMPARTS(YEAR(@PAYMENT_DATE1) + CASE WHEN MONTH(@PAYMENT_DATE1) <7 THEN 0 ELSE 1 END-2,7,1) THEN B2.DATEOFPAYMENT ELSE NULL END) AS [PREVIOUS_BEFROE_LFY_LAST_DATE]
    , YEAR(MIN(B2.DATEOFPAYMENT)) + CASE WHEN MONTH(MIN(B2.DATEOFPAYMENT)) <7 THEN 0 ELSE 1 END AS [PREVIOUS_FIRST_DATE_FY]
    , YEAR(MAX(B2.DATEOFPAYMENT)) + CASE WHEN MONTH(MAX(B2.DATEOFPAYMENT)) <7 THEN 0 ELSE 1 END AS [PREVIOUS_LAST_DATE_FY]
    , YEAR(
        MAX(CASE WHEN B2.DATEOFPAYMENT < DATEFROMPARTS(YEAR(@PAYMENT_DATE1) + CASE WHEN MONTH(@PAYMENT_DATE1) <7 THEN 0 ELSE 1 END-2,7,1) THEN B2.DATEOFPAYMENT ELSE NULL END)
      ) + CASE WHEN MONTH(
        MAX(CASE WHEN B2.DATEOFPAYMENT < DATEFROMPARTS(YEAR(@PAYMENT_DATE1) + CASE WHEN MONTH(@PAYMENT_DATE1) <7 THEN 0 ELSE 1 END-2,7,1) THEN B2.DATEOFPAYMENT ELSE NULL END)
      ) <7 THEN 0 ELSE 1 END AS [PREVIOUS_BEFROE_LFY_LAST_DATE_FY]
  FROM TBL_BATCHITEM B2
  WHERE (B2.REVERSED IS NULL OR NOT(B2.REVERSED IN (1, -1, 2))) AND B2.DATEOFPAYMENT <  @PAYMENT_DATE1
  GROUP BY B2.SERIALNUMBER
  HAVING B2.SERIALNUMBER IN (SELECT [SERIALNUMBER] FROM TBL_BATCHITEM WHERE [DATEOFPAYMENT] BETWEEN  @PAYMENT_DATE1 AND @PAYMENT_DATE2 GROUP BY [SERIALNUMBER])
)
-- ----------------------------------------------------------------------------------------------------
, cte_payments_with_donor_type AS (
  SELECT t1.*
    , CASE WHEN t2.PREVIOUS_LAST_DATE IS NULL THEN 0 ELSE DATEDIFF(d,t2.PREVIOUS_LAST_DATE, t1.THIS_FIRST_DATE) END AS [DAYS_TO_THIS_FIRST_DATE]
    , CASE WHEN t2.PREVIOUS_LAST_DATE IS NULL THEN 0 ELSE DATEDIFF(d,t2.PREVIOUS_LAST_DATE, t1.DATEOFPAYMENT) END AS [DAYS_TO_DATEOFPAYMENT]
    , CASE WHEN t2.PREVIOUS_FIRST_DATE IS NULL THEN t1.THIS_FIRST_DATE ELSE t2.PREVIOUS_FIRST_DATE END AS [FIRST_DATE]
    , CASE WHEN t1.DATEOFPAYMENT = CASE WHEN t2.PREVIOUS_FIRST_DATE IS NULL THEN t1.THIS_FIRST_DATE ELSE t2.PREVIOUS_FIRST_DATE END
      THEN -1
      ELSE 0
      END AS [IS_ACQUISITION]
    , CASE WHEN t3.NAME IS NULL THEN 'UNDEFINED' ELSE t3.NAME END AS [MARKETING_CYCLE]
    , CASE WHEN LEFT(t1.MARKETING_ACTIVITY, 2) = '__' THEN -1 ELSE 0 END AS [IS_MARKETING_ACTIVITY_ONGOING]
    , CASE WHEN SUBSTRING(t1.MARKETING_ACTIVITY, 3, 2) = '__' THEN -1 ELSE 0 END AS [IS_MARKETING_ACTIVITY_GENERAL]
    , t2.PREVIOUS_FIRST_DATE
    , t2.PREVIOUS_BEFROE_LFY_LAST_DATE
    , t2.PREVIOUS_LAST_DATE
    , t2.PREVIOUS_FIRST_DATE_FY
    , t2.PREVIOUS_BEFROE_LFY_LAST_DATE_FY
    , t2.PREVIOUS_LAST_DATE_FY
    , CASE WHEN
        MONTH(@PAYMENT_DATE1) = 7 AND DAY(@PAYMENT_DATE1) =1
        AND YEAR(@PAYMENT_DATE1) + CASE WHEN MONTH(@PAYMENT_DATE1) <7 THEN 0 ELSE 1 END = YEAR(@PAYMENT_DATE2) + CASE WHEN MONTH(@PAYMENT_DATE2) <7 THEN 0 ELSE 1 END
      THEN
        CASE WHEN t2.PREVIOUS_LAST_DATE_FY IS NULL
        THEN 'NEW'
        ELSE
          CASE WHEN t2.PREVIOUS_LAST_DATE_FY < t1.PAYMENT_FY - 1
          THEN 'REC'
          ELSE 'CON'
          END
        END
      ELSE 'N/A' END AS [LINE_FY_DONTYPE1]
    , CASE WHEN
        MONTH(@PAYMENT_DATE1) = 7 AND DAY(@PAYMENT_DATE1) =1
        AND YEAR(@PAYMENT_DATE1) + CASE WHEN MONTH(@PAYMENT_DATE1) <7 THEN 0 ELSE 1 END = YEAR(@PAYMENT_DATE2) + CASE WHEN MONTH(@PAYMENT_DATE2) <7 THEN 0 ELSE 1 END
      THEN
        CASE WHEN t2.PREVIOUS_LAST_DATE_FY IS NULL
        THEN '1NEW'
        ELSE
          CASE WHEN t2.PREVIOUS_LAST_DATE_FY < t1.PAYMENT_FY - 1
          THEN '1REC'
          ELSE
            CASE WHEN t2.PREVIOUS_FIRST_DATE_FY = t1.PAYMENT_FY - 1
            THEN '2NEW'
            ELSE
              CASE WHEN t2.PREVIOUS_BEFROE_LFY_LAST_DATE_FY < t2.PREVIOUS_LAST_DATE_FY -1
              THEN '2REC'
              ELSE 'MULTI'
              END
            END
          END
        END
      ELSE 'N/A' END AS [LINE_FY_DONTYPE2]
  FROM
    cte_payments t1
    LEFT JOIN cte_previous_date t2 ON (t1.SERIALNUMBER = t2.SERIALNUMBER)
    LEFT JOIN cte_market_cycle t3 ON (SUBSTRING(t1.MARKETING_ACTIVITY, 3, 2) = t3.CODE)
)
-- ----------------------------------------------------------------------------------------------------
/*<BASE_QUERY>*/
select * from cte_payments_with_donor_type
/*</BASE_QUERY>*/
-- ----------------------------------------------------------------------------------------------------
-- OPTION(RECOMPILE)
-- ----------------------------------------------------------------------------------------------------