SELECT
  YEAR(C1.CREATED) + CASE WHEN MONTH(C1.CREATED) < 7 THEN 0 ELSE 1 END AS [FY]
  , COUNT(C1.SERIALNUMBER) AS [CONTACTS]
FROM
  TBL_CONTACT C1
WHERE
  C1.CONTACTTYPE NOT LIKE 'ADDRESS' AND C1.CREATED IS NOT NULL
GROUP BY
  YEAR(C1.CREATED) + CASE WHEN MONTH(C1.CREATED) < 7 THEN 0 ELSE 1 END
ORDER BY
  YEAR(C1.CREATED) + CASE WHEN MONTH(C1.CREATED) < 7 THEN 0 ELSE 1 END
