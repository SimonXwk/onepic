SELECT * FROM
(
  -- -----------------------------------------------------------------------------------------
  SELECT SUM(TOTAL) AS TOTAL, 'TLMA' AS ATTR1, SOLICIT AS ATTR2, 0 AS COLMUN, 1 AS STREAM
  FROM cte_sankey_attributes
  GROUP BY SOLICIT

  UNION
  SELECT SUM(TOTAL) AS TOTAL, SOLICIT AS ATTR1, PLATFORM AS ATTR2, 1 AS COLMUN, 1 AS STREAM
  FROM cte_sankey_attributes
  GROUP BY SOLICIT, PLATFORM

  UNION
  SELECT SUM(TOTAL) AS TOTAL, PLATFORM AS ATTR1, TQTYPE AS ATTR2, 2 AS COLMUN, 1 AS STREAM
  FROM cte_sankey_attributes
  GROUP BY PLATFORM, TQTYPE

  UNION
  SELECT SUM(TOTAL) AS TOTAL, TQTYPE AS ATTR1, ACCOUNT AS ATTR2, 3 AS COLMUN, 1 AS STREAM
  FROM cte_sankey_attributes
  GROUP BY TQTYPE, ACCOUNT
  -- -----------------------------------------------------------------------------------------
  UNION
  SELECT SUM(TOTAL) AS TOTAL, 'TLMA' AS ATTR1, TQTYPE AS ATTR2, 0 AS COLMUN, 2 AS STREAM
  FROM cte_sankey_attributes
  GROUP BY TQTYPE

  UNION
  SELECT SUM(TOTAL) AS TOTAL, TQTYPE AS ATTR1, DES1 AS ATTR2, 1 AS COLMUN, 2 AS STREAM
  FROM cte_sankey_attributes
  GROUP BY TQTYPE, DES1

  UNION
  SELECT SUM(TOTAL) AS TOTAL, DES1 AS ATTR1, DES2 AS ATTR2, 2 AS COLMUN, 2 AS STREAM
  FROM cte_sankey_attributes
  GROUP BY DES1, DES2
 -- -----------------------------------------------------------------------------------------

) AS T1
ORDER BY T1.STREAM ASC, T1.COLMUN ASC, T1.TOTAL DESC