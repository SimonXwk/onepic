SELECT
  DISTINCT [FY] = YEAR(T1.DATEOFPAYMENT) + IIF(MONTH(T1.DATEOFPAYMENT)<7,0,1)
FROM
  dbo.TBL_BATCHITEM T1
WHERE
  (T1.REVERSED IS NULL OR NOT (T1.REVERSED = -1 OR T1.REVERSED =1 OR T1.REVERSED =2))
ORDER BY
  [FY] ASC
