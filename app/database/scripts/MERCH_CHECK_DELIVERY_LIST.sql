DECLARE @COMM_REF VARCHAR (10) = /*<DATE_START>*/'M29494'/*</DATE_START>*/;
-- --------------------------------------------------------------------------------
WITH
-- --------------------------------------------------------------------------------
cte_rex_orders as (
  SELECT
    B2.SERIALNUMBER ,B2.DATEOFPAYMENT
    , LTRIM(RTRIM(ISNULL(B2.MANUALRECEIPTNO, ''))) AS [MANUALRECEIPTNO]
    , CASE WHEN LTRIM(RTRIM(B2.MANUALRECEIPTNO)) LIKE '[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
      THEN LTRIM(RTRIM(B2.MANUALRECEIPTNO))
      ELSE
        CASE WHEN B2.NOTES IS NOT NULL AND B2.NOTES LIKE '%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
        THEN SUBSTRING(B2.NOTES, PATINDEX('%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%', B2.NOTES) + LEN('REX Order Number:') + 1, 11)
        ELSE NULL
        END
      END AS [REXORDERID]
    , DENSE_RANK() OVER(PARTITION BY B2.SERIALNUMBER ORDER BY
        CASE WHEN LTRIM(RTRIM(B2.MANUALRECEIPTNO)) LIKE '[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
        THEN LTRIM(RTRIM(B2.MANUALRECEIPTNO))
        ELSE
          CASE WHEN B2.NOTES IS NOT NULL AND B2.NOTES LIKE '%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
          THEN SUBSTRING(B2.NOTES, PATINDEX('%REX Order Number: [0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%', B2.NOTES) + LEN('REX Order Number:') + 1, 11)
          ELSE NULL
          END
        END
      ASC) AS [REXORDERSEQ]
  FROM
    TBL_BATCHITEM B2
    LEFT JOIN TBL_BATCHHEADER B4 ON (B2.ADMITNAME = B4.ADMITNAME)
  WHERE
    (B2.REVERSED IS NULL OR NOT (B2.REVERSED=1 OR B2.REVERSED=-1 OR B2.REVERSED=2)) -- Full reversal and re-entry should be excluded all time
    AND (B4.STAGE ='Batch Approved')
    AND (B2.MANUALRECEIPTNO LIKE '%[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
      OR B2.NOTES LIKE '%[0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%')
)
-- --------------------------------------------------------------------------------
,cte_first_date as (
  SELECT SERIALNUMBER, MIN(DATEOFPAYMENT) AS [FIRSTDATE]
  FROM TBL_BATCHITEM
  WHERE (REVERSED IS NULL OR REVERSED NOT IN (-1, 1, 2))
  GROUP BY SERIALNUMBER
)
-- --------------------------------------------------------------------------------
,cte_first_date_orders as (
  SELECT ct1.SERIALNUMBER, ct1.[FIRSTDATE] , ct2.[REXORDERID], ct2.[REXORDERSEQ]
  FROM
    cte_first_date ct1
    LEFT OUTER JOIN cte_rex_orders ct2 ON (ct1.SERIALNUMBER = ct2.SERIALNUMBER) AND (ct2.DATEOFPAYMENT = ct1.[FIRSTDATE])
  -- WHERE
  --   ct1.REXORDERID IS NOT NULL
  GROUP BY ct1.SERIALNUMBER, ct1.[FIRSTDATE] , ct2.[REXORDERID], ct2.[REXORDERSEQ]
)
-- --------------------------------------------------------------------------------
,cte_mail_receivers as (
  SELECT SERIALNUMBER
  FROM TBL_COMMUNICATION
  WHERE COMMUNICATIONREF = @COMM_REF
  GROUP BY SERIALNUMBER
)
-- --------------------------------------------------------------------------------
select
  t1.SERIALNUMBER
  ,t2.[FIRSTDATE]
  ,t3.DATEOFPAYMENT
  -- ,[ORDER1] = MIN(t2.REXORDERSEQ)
  -- ,[ORDER2] = MIN(CASE WHEN t2.[REXORDERSEQ] = 2 THEN t2.REXORDERID ELSE NULL END)
  -- ,[ORDER3] = MIN(CASE WHEN t2.[REXORDERSEQ] = 3 THEN t2.REXORDERID ELSE NULL END)
from
  cte_mail_receivers t1
  left join cte_first_date t2 on t1.SERIALNUMBER = t2.SERIALNUMBER
  left join cte_rex_orders t3 on t2.SERIALNUMBER = t2.SERIALNUMBER and t2.[FIRSTDATE] = t3.DATEOFPAYMENT
-- group by
--   t1.SERIALNUMBER,t2.[FIRSTDATE]
order by SERIALNUMBER
-- select * from cte_first_date_orders
-- where SERIALNUMBER = '0343016'
-- --------------------------------------------------------------------------------
-- OPTION(RECOMPILE)
-- --------------------------------------------------------------------------------