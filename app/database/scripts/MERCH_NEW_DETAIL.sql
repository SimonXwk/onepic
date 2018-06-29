WITH
cte_merch_payments as (
SELECT
  B1.SERIALNUMBER
  , B2.DATEOFPAYMENT
  , B2.MANUALRECEIPTNO
FROM
  TBL_BATCHITEMSPLIT        B1
  LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
  LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
  LEFT JOIN TBL_SOURCECODE  S1 ON (B1.SOURCECODE = S1.SOURCECODE)
WHERE
  (B2.REVERSED IS NULL OR NOT (B2.REVERSED=1 OR B2.REVERSED=-1 OR B2.REVERSED=2)) -- Full reversal and re-entry should be excluded all time
  AND (B4.STAGE ='Batch Approved')
  AND (S1.SOURCETYPE LIKE 'MERCH%')
)
-- --------------------------------------------------------------
,cte_first_date as (
SELECT SERIALNUMBER, FIRSTDATE=MIN(DATEOFPAYMENT)
FROM cte_merch_payments
GROUP BY SERIALNUMBER
)
  -- --------------------------------------------------------------
,cte_first_orders as (
SELECT SERIALNUMBER, FIRSTDATE=MIN(DATEOFPAYMENT)
FROM cte_merch_payments
GROUP BY SERIALNUMBER
)
-- --------------------------------------------------------------
select
  t1.SERIALNUMBER
  , t2.FIRSTDATE
  , FIRSTORDER=MIN(MANUALRECEIPTNO)
from
  cte_merch_payments t1
  left join cte_first_date t2 on (t1.DATEOFPAYMENT = t2.FIRSTDATE)
where
  DATEOFPAYMENT = FIRSTDATE
  AND t2.FIRSTDATE BETWEEN '20180601' AND '20180630'
group by
  t1.SERIALNUMBER, t2.FIRSTDATE
order by
  t2.FIRSTDATE desc