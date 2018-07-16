DECLARE @D1 Date, @D2 Date;
SET @D1 = '20180701'
SET @D2 = '20190701';

with
-- ------------------------------------------------------------------------------------------------------------------------------------
ones AS ( SELECT * FROM (VALUES (0), (1), (2), (3), (4),(5), (6), (7), (8), (9)) AS numbers(x) )
-- ------------------------------------------------------------------------------------------------------------------------------------
, generation_def AS ( SELECT * FROM (VALUES
   (0,1824,'ANCIENT','01.AC')
   ,(1825,1844,'EARLY COLONIAL','02.EC')
   ,(1845,1864,'MID COLONIAL','03.MC')
   ,(1865,1884,'LATE COLONIAL','04.LC')
   ,(1885,1904,'HARD TIMERS','05.HT')
   ,(1905,1924,'FEDERATION','06.F')
   ,(1925,1944,'SILENT','07.S')
   ,(1945,1964,'BABY BOOMERS','08.BB')
   ,(1965,1979,'GENERATION X','09.X')
   ,(1980,1994,'GENERATION Y','10.Y')
   ,(1995,2009,'GENERATION Z','11.Z')
   ,(2010,9999,'MILLENIALS','12.M')  ) AS generation(y1,y2,gen,gen_abr) )

-- ------------------------------------------------------------------
, cte_payments_value as (
SELECT
  B1.SERIALNUMBER
FROM
  TBL_BATCHITEMSPLIT        B1
  LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
  LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
  LEFT JOIN TBL_SOURCECODE  S1 ON (B1.SOURCECODE = S1.SOURCECODE)
WHERE
  (B2.REVERSED IS NULL OR NOT(B2.REVERSED=1 OR B2.REVERSED=-1)) AND (B4.STAGE ='Batch Approved')
)
-- ------------------------------------------------------------------
, cte_payments_trans_d1 as (
SELECT
  B1.SERIALNUMBER, MIN(B2.DATEOFPAYMENT) AS MIN_DOP
FROM
  TBL_BATCHITEMSPLIT        B1
  LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
  LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
WHERE
  (B2.REVERSED IS NULL OR NOT(B2.REVERSED=1 OR B2.REVERSED=-1 OR B2.REVERSED=2)) AND (B4.STAGE ='Batch Approved')
GROUP BY
  B1.SERIALNUMBER
)
-- ------------------------------------------------------------------
, cte_payments_trans_d2 as (
SELECT
  B1.SERIALNUMBER, MIN(B2.DATEOFPAYMENT) AS MIN_DOP
FROM
  TBL_BATCHITEMSPLIT        B1
  LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
  LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
WHERE
  (B2.REVERSED IS NULL OR NOT(B2.REVERSED=1 OR B2.REVERSED=-1 OR B2.REVERSED=2)) AND (B4.STAGE ='Batch Approved')
GROUP BY
  B1.SERIALNUMBER
)
-- ------------------------------------------------------------------------------------------------------------------------------------
, cte_contact as (
SELECT
  C1.SERIALNUMBER,D1=@D1,D2=@D2
  , FULLNAME=CONCAT(
      IIF(RTRIM(C1.TITLE)='' OR C1.TITLE IS NULL,'',RTRIM(C1.TITLE)+' ')
      ,IIF(RTRIM(C1.FIRSTNAME)='' OR C1.FIRSTNAME IS NULL,'',RTRIM(C1.FIRSTNAME)+' ')
      ,IIF(RTRIM(C1.OTHERINITIAL)='' OR C1.OTHERINITIAL IS NULL,'',RTRIM(C1.OTHERINITIAL)+' '),C1.KEYNAME)
  ,DECD = IIF(C1.DONOTMAILREASON LIKE '%Deceased%',-1,0)
  ,ESTATE = IIF(C1.PRIMARYCATEGORY LIKE '%ESTATE%',-1,0)
  ,SEL1_EXIST = IIF(C1.CREATED<@D1,-1,0)
  ,SEL2_EXIST = IIF(C1.CREATED<@D2,-1,0)
--   ,SEL1_DECD =  IIF(C1.DONOTMAILREASON NOT LIKE '%Deceased%', 0
--                   ,IIF(C1.DONOTMAILFROM IS  NULL, IIF()
--                     ,IIF(IIF(@D1 > C1.DONOTMAILFROM,0, -1))
--                   )
--                 )

FROM
  TBL_CONTACT C1
WHERE C1.CONTACTTYPE NOT LIKE 'ADDRESS'

)

-- ------------------------------------------------------------------



select
*
from cte_contact
-- where SEL2_EXIST = 0