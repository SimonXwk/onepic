WITH
ONES AS (
  SELECT * FROM (VALUES (0), (1), (2), (3), (4),(5), (6), (7), (8), (9)) AS numbers(X)
)
-- --------------------------------------------------------------
,CALENDAR_YEARS AS (
  SELECT fourdigits.num AS CY
  FROM (SELECT (1000*d1000.X + 100*d100.X + 10*d10.X + d1.X) AS num FROM ONES d1, ONES d10, ONES d100, ONES d1000 ) fourdigits
  WHERE fourdigits.num BETWEEN 1000 AND YEAR(CURRENT_TIMESTAMP)+1
)
-- --------------------------------------------------------------
,TRX_FY_RNG AS (
  SELECT CY AS FY
  FROM CALENDAR_YEARS
  WHERE CY  BETWEEN (SELECT (YEAR(MIN(DATEOFPAYMENT))+IIF(MONTH(MIN(DATEOFPAYMENT))<7,0,1)) FROM TBL_BATCHITEM)
            AND     (SELECT (YEAR(MAX(DATEOFPAYMENT))+IIF(MONTH(MAX(DATEOFPAYMENT))<7,0,1)) FROM TBL_BATCHITEM)
)
-- --------------------------------------------------------------
,TOTAL_FY AS (
  SELECT
    (YEAR(B2.DATEOFPAYMENT)+IIF(MONTH(B2.DATEOFPAYMENT)<7,0,1)) AS FY
    ,SUM(B1.PAYMENTAMOUNT) AS TOTAL
  FROM
    TBL_BATCHITEMSPLIT        B1
    LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
    LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
  WHERE
    (B2.REVERSED IS NULL OR NOT(B2.REVERSED=1 OR B2.REVERSED=-1)) AND (B4.STAGE ='Batch Approved')
    AND IIF(MONTH(B2.DATEOFPAYMENT)<7, MONTH(B2.DATEOFPAYMENT)+6, MONTH(B2.DATEOFPAYMENT)-6)*100 + DAY(B2.DATEOFPAYMENT) <= IIF(MONTH(B2.DATEOFPAYMENT)<7, MONTH(CURRENT_TIMESTAMP )+6, MONTH(CURRENT_TIMESTAMP )-6)*100 + DAY(CURRENT_TIMESTAMP)
    AND (YEAR(B2.DATEOFPAYMENT)+IIF(MONTH(B2.DATEOFPAYMENT)<7,0,1)) <= ?
  GROUP BY
    (YEAR(B2.DATEOFPAYMENT)+IIF(MONTH(B2.DATEOFPAYMENT)<7,0,1))
)
-- --------------------------------------------------------------
select
  T1.FY,T2.TOTAL
from
  TRX_FY_RNG T1 left join TOTAL_FY T2 on (T1.FY=T2.FY)
order by FY
