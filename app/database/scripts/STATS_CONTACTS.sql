;
WITH
-- ------------------------------------------------------------------------------------------------------------------------------------
ones AS ( SELECT * FROM (VALUES (0), (1), (2), (3), (4),(5), (6), (7), (8), (9)) AS numbers(x) )
-- ------------------------------------------------------------------------------------------------------------------------------------
, generation_def AS ( SELECT * FROM (VALUES
   (0,1824,'ANCIENT','01.AC')
   ,(1825,1844,'EARLY COLONIAL','02.EC')
   ,(1845,1864,'MID COLONIAL','03.MC')
   ,(1865,1884,'LATE COLONIAL','04.LC')
   ,(1885,1904,'HARD TIMERS','05.HT')
   ,(1905,1924,'FEDERATION','06.F')
   ,(1925,1944,'SILENT','07.S')
   ,(1945,1964,'BABY BOOMERS','08.BB')
   ,(1965,1979,'GENERATION X','09.X')
   ,(1980,1994,'GENERATION Y','10.Y')
   ,(1995,2009,'GENERATION Z','11.Z')
   ,(2010,9999,'MILLENIALS','12.M')  ) AS generation(y1,y2,gen,gen_abr) )

-- ------------------------------------------------------------------------------------------------------------------------------------
, cte_contacts as (
SELECT
  C1.SERIALNUMBER
  , FULLNAME = CONCAT(
      CASE WHEN C1.TITLE IS NULL OR RTRIM(C1.TITLE)='' THEN '' ELSE RTRIM(C1.TITLE) + ' ' END
    , CASE WHEN C1.FIRSTNAME IS NULL OR RTRIM(C1.FIRSTNAME)='' THEN '' ELSE RTRIM(C1.FIRSTNAME) + ' ' END
    , CASE WHEN C1.OTHERINITIAL IS NULL OR RTRIM(C1.OTHERINITIAL)='' THEN '' ELSE RTRIM(C1.OTHERINITIAL) + ' ' END
    , RTRIM(C1.KEYNAME))
  , C1.CONTACTTYPE
  , C1.PRIMARYCATEGORY
  , C1.SOURCE
  , CASE WHEN C1.MAJORDONOR = -1 THEN -1 ELSE 0 END AS [MAJORDONOR]
  , CASE WHEN C1.CONTACTTYPE = 'Individual' AND (C1.DATEOFBIRTH IS NULL OR RTRIM(C1.DATEOFBIRTH)='') THEN -1 ELSE 0 END AS [NODOB]
  , CASE WHEN C1.DONOTMAIL = -1 THEN -1 ELSE 0 END AS [DNM]
  , CASE WHEN C2.DONOTCALL = -1 THEN -1 ELSE 0 END AS [DNC]
  , CASE WHEN C1.DONOTMAIL = -1 AND C1.DONOTMAILREASON LIKE '%Deceased%' THEN -1 ELSE 0 END AS [DECD]
  , CASE WHEN C1.PRIMARYCATEGORY LIKE '%ESTATE%' THEN -1 ELSE 0 END AS [ESTATE]

FROM
  TBL_CONTACT C1
  LEFT JOIN TBL_CONTACTATTRIBUTE C2 ON (C1.SERIALNUMBER = C2.SERIALNUMBER)
WHERE C1.CONTACTTYPE NOT LIKE 'ADDRESS'
)
-- ------------------------------------------------------------------------------------------------------------------------------------
select
  count(t1.SERIALNUMBER) as [CONTACTS]
  , t1.CONTACTTYPE
  , t1.PRIMARYCATEGORY
  , t1.[MAJORDONOR]
  , t1.[ESTATE]
  , t1.[DNM]
  , t1.[DECD]
  , t1.[NODOB]
  , t1.[DNC]
from
  cte_contacts t1
group by
  t1.CONTACTTYPE
  , t1.CONTACTTYPE
  , t1.PRIMARYCATEGORY
  , t1.[MAJORDONOR]
  , t1.[ESTATE]
  , t1.[DNM]
  , t1.[DECD]
  , t1.[NODOB]
  , t1.[DNC]
-- ------------------------------------------------------------------------------------------------------------------------------------
