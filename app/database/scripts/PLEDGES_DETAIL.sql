select *
from cte_pledge
where
    CREATED between
    DATEFROMPARTS(/*<START_YEAR>*/@FY-1/*</START_YEAR>*/,/*<START_MTH>*/7/*</START_MTH>*/,/*<START_DAY>*/1/*</START_DAY>*/)
    and
    DATEFROMPARTS(/*<END_YEAR>*/@FY/*</END_YEAR>*/,/*<END_MTH>*/6/*</END_MTH>*/,/*<END_DAY>*/30/*</END_DAY>*/)

order by CREATED desc