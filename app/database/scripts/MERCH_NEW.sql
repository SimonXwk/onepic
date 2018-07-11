WITH
cte_sourcecode AS (
  SELECT
      SOURCECODE, SOURCETYPE, DESTINATIONCODE AS DDES1, DESTINATIONCODE2  AS DDES2
      ,ADDITIONALCODE3 AS CAMPAIGNCODE, ADDITIONALCODE1 AS ACCOUNT, ADDITIONALCODE5 AS CLASS
      ,CREATED
  FROM TBL_SOURCECODE
)
----------------------------------------------------------------------------------------------------------------------------
select *
from cte_sourcecode
where CREATED