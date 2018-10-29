DECLARE @FY1M AS INT = 7;
WITH
-- --------------------------------------------------------------
ONES AS ( SELECT * FROM (VALUES (0), (1), (2), (3), (4),(5), (6), (7), (8), (9)) AS numbers(X))
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
  WHERE CY  BETWEEN (SELECT (YEAR(MIN(/*<FILED>*/DATEOFPAYMENT/*</FILED>*/))+IIF(MONTH(MIN(/*<FILED>*/DATEOFPAYMENT/*</FILED>*/))<@FY1M OR @FY1M=1,0,1)) FROM TBL_BATCHITEM)
            AND     (SELECT (YEAR(MAX(/*<FILED>*/DATEOFPAYMENT/*</FILED>*/))+IIF(MONTH(MAX(/*<FILED>*/DATEOFPAYMENT/*</FILED>*/))<@FY1M OR @FY1M=1,0,1)) FROM TBL_BATCHITEM)
)



SELECT DISTINCT YEAR(/*<FILED>*/DATEOFPAYMENT/*</FILED>*/) + IIF(MONTH(/*<FILED>*/DATEOFPAYMENT/*</FILED>*/)<7,0,1) AS [FY]
FROM dbo./*<TABLE>*/TBL_BATCHITEM/*</TABLE>*/
ORDER BY [FY] ASC