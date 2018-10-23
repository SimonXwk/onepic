WITH
cte_sourcecode AS (
  SELECT
    SOURCECODE, SOURCETYPE
    , [DDES1] = DESTINATIONCODE
    , [DDES2] = DESTINATIONCODE2
    , [CAMPAIGNCODE] = ADDITIONALCODE3
    , [ACCOUNT] = ADDITIONALCODE1
    , [CLASS] =ADDITIONALCODE5
    , [DEP] = IIF(ADDITIONALCODE5 IS NULL, 'MISSING', LEFT(ADDITIONALCODE5, 2))
    , SOURCESTARTDATE , SOURCEENDDATE
    , CREATED, CREATEDBY, MODIFIED, MODIFIEDBY
    , SOURCEDESCRIPTION, SOURCENOTES, EXCLUDEFROMDROPDOWN, ARCHIVE, TAXDEDUCTIBLE, GOODSTAXAPPLICABLE
  FROM TBL_SOURCECODE
)
----------------------------------------------------------------------------------------------------------------------------
select S1.*
  , SUM(B1.PAYMENTAMOUNT) AS TOTAL
from cte_sourcecode S1
  left join TBL_BATCHITEMSPLIT B1 ON (S1.SOURCECODE = B1.SOURCECODE)
where S1.ARCHIVE is null or S1.ARCHIVE <> -1
group by
  S1.SOURCECODE, S1.SOURCETYPE, S1.DDES1, S1.DDES2, S1.CAMPAIGNCODE, S1.ACCOUNT, S1.CLASS, S1.DEP
  , S1.SOURCESTARTDATE, SOURCEENDDATE, S1.CREATED, S1.CREATEDBY, S1.MODIFIED, S1.MODIFIEDBY
  , S1.SOURCEDESCRIPTION, S1.SOURCENOTES, S1.EXCLUDEFROMDROPDOWN, S1.ARCHIVE, S1.TAXDEDUCTIBLE, S1.GOODSTAXAPPLICABLE
order by S1.CREATED desc