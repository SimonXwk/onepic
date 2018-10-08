;
WITH
-- ----------------------------------------------------------------------------------------------------
cte_payments AS(
SELECT
  B1.SERIALNUMBER, B1.PAYMENTAMOUNT, B1.GSTAMOUNT, B1.SOURCECODE, B1.SOURCECODE2, B1.DESTINATIONCODE, B1.DESTINATIONCODE2

  -- >>>> From BATCH_ITEM Table
  , B2.DATEOFPAYMENT
  , YEAR(B2.DATEOFPAYMENT) + CASE WHEN MONTH(B2.DATEOFPAYMENT) < 7 THEN 0 ELSE 1 END AS [FY]
  , MONTH(B2.DATEOFPAYMENT) + CASE WHEN MONTH(B2.DATEOFPAYMENT) < 7 THEN 6 ELSE -6 END AS [FYMTH]
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

--   , DATEDIFF(day, DATEFROMPARTS(YEAR(B2.DATEOFPAYMENT) + CASE WHEN MONTH(B2.DATEOFPAYMENT) < 7 THEN -1 ELSE 0 END,7,1), B2.DATEOFPAYMENT) AS [FYLATENCY]

  -- >>>> From SOURCE_CODE Table
  , S1.SOURCETYPE , S1.ADDITIONALCODE1 AS [ACCOUNT], S1.ADDITIONALCODE5 AS [CLASS]
  , CASE WHEN S1.SOURCETYPE LIKE '%Merchandise%'
    THEN 'Merchandise'
    ELSE
      CASE WHEN S1.SOURCETYPE = 'Bequest'
      THEN 'Bequest'
      ELSE 'Fundraising'
      END
    END AS [STREAM]

  -- >>>> From PLEDGE_HEADER Table
  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' THEN P1.PLEDGEID ELSE NULL END AS [PLEDGEID]

  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL
    THEN
      CASE WHEN B1.SOURCECODE = 'TLCSPON' THEN 'TLC'
      ELSE
        CASE WHEN B1.SOURCECODE IN ('SACTIONP','ACTCRA','ACTCRM') THEN 'ACTION PARTNER'
        ELSE
          CASE WHEN B1.SOURCECODE = 'SPERSON' THEN 'PERSONAL SUPPORT'
          ELSE
            CASE WHEN B1.SOURCECODE IN ('SCOUNTRY','SPNEPAL','SPNG','SNIGER','SINDIA','STHAIL','SNIGERIA','SMYANM','SETIMOR','SNIGERIA','SCHINA','SCONGO') THEN 'COUNTRY SUPPORT'
            ELSE
              CASE WHEN B1.SOURCECODE LIKE '%SCURE%' OR B1.SOURCECODE IN ('CUREONE1', 'CUREONE2') THEN 'CURE ONE'
              ELSE '_AMBIGUOUS'
              END
            END
          END
        END
      END
    ELSE NULL
    END AS [PLEDGETYPE]

  , CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL
    THEN P1.PLEDGERECRUITEDBY
    ELSE NULL
    END AS [RECRUITMENT]

  -- >>>> From SOURCECODE AND PLEDGE_HEADER Table
  , CASE WHEN S1.ADDITIONALCODE3 IS NULL OR RTRIM(S1.ADDITIONALCODE3) = '' OR S1.ADDITIONALCODE3 LIKE '%Unsolicited%'
    THEN
      CASE WHEN S1.SOURCETYPE LIKE '%SPONSORSHIP%' AND P1.PLEDGEID IS NOT NULL
      THEN
        CASE WHEN P1.RECRUITMENTMETHOD IS NULL OR P1.RECRUITMENTMETHOD LIKE '%Unsolicited%'
        THEN '____.Unsolicited'
        ELSE P1.RECRUITMENTMETHOD
        END
      ELSE '____.Unsolicited'
      END
    ELSE S1.ADDITIONALCODE3
    END AS [CAMPAIGNCODE]

FROM
  TBL_BATCHITEMSPLIT            B1
  LEFT JOIN TBL_BATCHITEM       B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
  LEFT JOIN TBL_BATCHITEMPLEDGE B3 ON (B1.SERIALNUMBER = B3.SERIALNUMBER) AND (B1.RECEIPTNO = B3.RECEIPTNO) AND (B1.ADMITNAME = B3.ADMITNAME) AND (B1.LINEID = B3.LINEID)
  LEFT JOIN TBL_PLEDGEHEADER    P1 ON (B3.PLEDGEID = P1.PLEDGEID)
  LEFT JOIN TBL_BATCHHEADER     B4 ON (B2.ADMITNAME = B4.ADMITNAME)
  LEFT JOIN Tbl_SOURCECODE      S1 ON (B1.SOURCECODE = S1.SOURCECODE)
WHERE
  (B2.REVERSED IS NULL OR NOT(B2.REVERSED IN (1, -1))) AND (B4.STAGE ='Batch Approved')
  AND B2.DATEOFPAYMENT BETWEEN ? AND ?
)
-- ----------------------------------------------------------------------------------------------------
/*<BASE_QUERY>*/
select * from cte_payments
/*</BASE_QUERY>*/