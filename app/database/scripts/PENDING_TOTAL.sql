WITH
-- -------------------------------------------
cte_pending AS(
  SELECT
    SUM(B1.PAYMENTAMOUNT) AS TOTAL,B1.CREATEDBY
  FROM
    TBL_BATCHITEMSPLIT    B1
    LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
    LEFT JOIN TBL_OBJECT  O ON (B1.ADMITNAME = O.ADMITNAME)
    LEFT JOIN TBL_STAGE   S ON (O.STAGEID = S.STAGEID)
  WHERE
    (B2.REVERSED IS NULL OR NOT(B2.REVERSED=1 OR B2.REVERSED=-1)) AND (S.STAGE <> 'Batch Approved')
  GROUP BY
    B1.CREATEDBY
)
-- -------------------------------------------
select
  TOTAL = ISNULL(SUM(TOTAL),0)
  ,CREATEORS = (select stuff((select ',' + QUOTENAME(CREATEDBY,'') from cte_pending group by CREATEDBY for xml path('')),1,1,''))
from cte_pending