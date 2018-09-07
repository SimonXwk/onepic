select t1.*
from cte_legit_pledge t1
where
  t1.PLEDGESTATUS = 'Active'
  or ( t1.[CREATED_FY] = /*<FY>*/2019/*</FY>*/ )
  or (
    (t1.PLEDGESTATUS <> 'Active' or t1.PLEDGESTATUS is null )
    and (
      ( t1.[END_FY] = /*<FY>*/2019/*</FY>*/ and t1.PLEDGESTATUS = 'Closed')
      or ( t1.[ONHOLD_FY] = /*<FY>*/2019/*</FY>*/ and t1.PLEDGESTATUS = 'On Hold' )
      or ( t1.[WRITTENDOWN_FY] = /*<FY>*/2019/*</FY>*/ and t1.PLEDGESTATUS = 'Written Down' )
  )
)