select
  *
from
  cte_contacts
where
  [CONTACT_CREATED] >= DATEADD(d, 1 , @FISHINGPOOL_DATE1)