SELECT
  DISTINCT [CREATED_FY] = YEAR(P1.CREATED) + IIF(MONTH(P1.CREATED)<7,0,1)
FROM
  dbo.TBL_PLEDGEHEADER P1
WHERE
  (RTRIM(ISNULL(P1.EXTERNALREF,''))='') AND (RTRIM(ISNULL(P1.EXTERNALREFTYPE,''))='')
ORDER BY
  [CREATED_FY] ASC