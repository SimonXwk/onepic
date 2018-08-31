select *
from cte_pledge
where CREATED between /*<CREATED_START>*/'20180701'/*</CREATED_START>*/ and /*<CREATED_END>*/'20190630'/*</CREATED_END>*/
order by CREATED desc