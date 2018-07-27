-- DECLARE
--   @SEG01 AS VARCHAR(25) = '00.New Contacts'
--   , @SEG02 AS VARCHAR(25) = '01.Pledge Givers'
--   , @SEG03 AS VARCHAR(25) = '02.Major Donors'
--   , @SEG04 AS VARCHAR(25) = '03.Premium Donors'
--   , @SEG05 AS VARCHAR(25) = '04.High Value Donors'
--   , @SEG06 AS VARCHAR(25) = '05.General Donors'
--   , @SEG07 AS VARCHAR(25) = '06.LYBUNT Donors'
--   , @SEG08 AS VARCHAR(25) = '07.SYBUNT Donors'
--   , @SEG09 AS VARCHAR(25) = '08.Groups'
--   , @SEG10 AS VARCHAR(25) = '09.Merchandise Only'
--   , @SEG11 AS VARCHAR(25) = '10.Never Given'
--   , @SEG12 AS VARCHAR(25) = '11.Third Party'
--   , @SEG13 AS VARCHAR(25) = '99.Deceased';

WITH
-- ------------------------------------------------------------------------
cte_segments AS (
SELECT SERIALNUMBER
, [FY] = RIGHT(PARAMETERNAME, 4)
, [SEGMENT] = CONCAT(PARAMETERVALUE,'.',PARAMETERNOTE)
FROM dbo.TBL_CONTACTPARAMETER
WHERE PARAMETERNAME LIKE 'FY____'
)
-- ------------------------------------------------------------------------
,cte_payments AS(
SELECT B1.SERIALNUMBER, B1.SOURCECODE , B1.PAYMENTAMOUNT
  , B2.DATEOFPAYMENT
  , [FY] = (YEAR(B2.DATEOFPAYMENT) + CASE WHEN MONTH(B2.DATEOFPAYMENT)<7 THEN 0 ELSE 1 END)
  , B2.REVERSED
--   , B2.RECEIPTNO ,B2.ADMITNAME
--   , S1.SOURCETYPE
--   , [ACCOUNT] = S1.ADDITIONALCODE1
--   , [CLASS] = S1.ADDITIONALCODE3
--   , [CAMPAIGNCODE] = S1.ADDITIONALCODE3
  , [TRXID] = CONCAT(B2.SERIALNUMBER, B2.ADMITNAME, B2.RECEIPTNO)
FROM
  dbo.TBL_BATCHITEMSPLIT B1
  LEFT JOIN dbo.TBL_BATCHITEM B2 ON (B1.SERIALNUMBER=B2.SERIALNUMBER AND B1.ADMITNAME=B2.ADMITNAME AND B1.RECEIPTNO=B2.RECEIPTNO)
  LEFT JOIN dbo.TBL_BATCHHEADER B4 ON (B1.ADMITNAME=B4.ADMITNAME)
  -- LEFT JOIN dbo.TBL_SOURCECODE S1 ON (B1.SOURCECODE=S1.SOURCECODE)
WHERE
  B4.STAGE='Batch Approved' AND (B2.REVERSED IS NULL OR (B2.REVERSED NOT IN (1,-1)))
)
-- ------------------------------------------------------------------------
, cte_payments_with_segments AS (
SELECT tp.*, ts.SEGMENT
--   , [DONOR_COUNT] = DENSE_RANK() OVER (PARTITION BY tp.FY, ts.SEGMENT ORDER BY tp.SERIALNUMBER ASC) -- This doesn't speed things up
  , [TRX_COUNT] = IIF(tp.REVERSED =2, 0, DENSE_RANK() OVER (PARTITION BY tp.FY, ts.SEGMENT, (CASE WHEN tp.REVERSED=2 THEN 2 ELSE NULL END) ORDER BY tp.TRXID))
FROM cte_payments tp LEFT JOIN cte_segments ts ON (tp.SERIALNUMBER = ts.SERIALNUMBER AND tp.FY = ts.FY)
)
-- ------------------------------------------------------------------------
, cte_fy_segments AS(
SELECT FY, SEGMENT, [CONTACTS] = COUNT(DISTINCT SERIALNUMBER)
FROM cte_segments
GROUP BY FY, SEGMENT
)
-- ------------------------------------------------------------------------
, cte_fy_active_donors_with_segment AS(
SELECT FY, SEGMENT
  , [DONORS] = COUNT(DISTINCT SERIALNUMBER)
--   , [DONORS] = MAX(DONOR_COUNT) -- This doesn't speed things up
  , [TRXS] = MAX(TRX_COUNT)  -- This adds another 2s
-- , [TRXS] = COUNT(DISTINCT TRXID)  -- This is slow adding about 25+ seconds
FROM cte_payments_with_segments ac1
WHERE REVERSED <> 2 OR REVERSED IS NULL
GROUP BY FY, SEGMENT
)
-- ------------------------------------------------------------------------

select
  [FY] = ISNULL(ts.FY, t1.FY)
  , [SEGMENT] = ISNULL(ts.SEGMENT,'SNF')
  , [CONTACTS] = ISNULL(ts.CONTACTS,0)
  , [DONORS] = ISNULL(t1.DONORS,0)
  , [TRXS] = ISNULL(t1.TRXS,0)
from
  cte_fy_segments ts
  full outer join cte_fy_active_donors_with_segment t1 on (ts.FY = t1.FY and ts.SEGMENT=t1.SEGMENT)
order by
  ts.fy asc, ts.SEGMENT asc


-- select
--   *
--   , [SEG_TOTAL] = ISNULL([00.New Contacts],0)
--     + ISNULL([01.Pledge Givers],0)
--     + ISNULL([02.Major Donors],0)
--     + ISNULL([03.Premium Donors],0)
--     + ISNULL([04.High Value Donors],0)
--     + ISNULL([05.General Donors],0)
--     + ISNULL([06.LYBUNT Donors],0)
--     + ISNULL([07.SYBUNT Donors],0)
--     + ISNULL([08.Groups],0)
--     + ISNULL([09.Merchandise Only],0)
--     + ISNULL([10.Never Given],0)
--     + ISNULL([11.Third Party],0)
--     + ISNULL([99.Deceased],0)
-- from
--   (
--     select
--       t1.FY, t2.DONORS
--       , t1.SEGMENT
--       , CONTACTS = COUNT(DISTINCT t1.SERIALNUMBER)
--     from
--       cte_segments t1
--       left join cte_fy_active_donors t2 on (t1.FY = t2.FY)
--     group by t1.FY, t2.DONORS, t1.SEGMENT
--   ) datatable
--   pivot
--   (
--     SUM(CONTACTS)
--     FOR SEGMENT IN (
--       [00.New Contacts]
--       ,[01.Pledge Givers]
--       ,[02.Major Donors]
--       ,[03.Premium Donors]
--       ,[04.High Value Donors]
--       ,[05.General Donors]
--       ,[06.LYBUNT Donors]
--       ,[07.SYBUNT Donors]
--       ,[08.Groups]
--       ,[09.Merchandise Only]
--       ,[10.Never Given]
--       ,[11.Third Party]
--       ,[99.Deceased]
--       )
--   ) pivottable