select
  t1.PLEDGEID
  ,t1.FULLNAME ,t1.SERIALNUMBER
  ,t1.CREATED ,t1.CREATEDBY
  ,t1.STARTDATE ,t1.ENDDATE
  ,t1.PLEDGEPLAN ,t1.PAYMENTTYPE ,t1.PAYMENTFREQUENCY, t1.INSTALMENTVALUE
  ,t1.FIRST_SOURCECODE1
  ,t1.SOURCECODES
  ,t1.SPONSORSHIP1
  ,t1.SPONSORSHIP2
  ,t1.CREDITCARDEXPIRY
  -- Summaries
  ,count(t2.DATEDUE) AS [DUES]
  ,min(t2.DATEDUE) AS [FIRSTOVERDUE]
  ,max(t2.DATEDUE) AS [LASTOVERDUE]
  ,datediff(day, min(t2.DATEDUE), getdate()) AS [FIRSTOVERDUE_LAPSED_DAYS]
from
  cte_legit_pledge t1
  left join TBL_PLEDGEINSTALMENTS_ACTIVE t2 on (t1.PLEDGEID = t2.PLEDGEID)
where
  t1.PLEDGESTATUS like '%Active%' AND t2.DATEDUE < CAST(CURRENT_TIMESTAMP AS DATE)
group by
  t1.PLEDGEID
  ,t1.FULLNAME ,t1.SERIALNUMBER
  ,t1.CREATED ,t1.CREATEDBY
  ,t1.STARTDATE ,t1.ENDDATE
  ,t1.PLEDGEPLAN ,t1.PAYMENTTYPE ,t1.PAYMENTFREQUENCY, t1.INSTALMENTVALUE
  ,t1.FIRST_SOURCECODE1
  ,t1.SOURCECODES
  ,t1.SPONSORSHIP1
  ,t1.SPONSORSHIP2
  ,t1.CREDITCARDEXPIRY
order by
  min(t2.DATEDUE) asc