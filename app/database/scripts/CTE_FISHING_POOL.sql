select
  --   C1.SN AS [SERIALNUMBER]
  -- , C1.CONTACT_CREATED

  COUNT(C1.SN) AS [COUNT]

  -- , DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) AS [NG1]
  -- , DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) AS [NG2]
  -- , DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) AS [LP1]
  -- , DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE2) AS [LP2]


  , CASE WHEN (D1.FISHING_HARD_FIRST_DATEOFPAYMENT) IS NULL
    THEN -- NG
      CASE WHEN C1.CONTACT_CREATED IS NULL OR DATEDIFF(day, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) < 0
      THEN 0
      ELSE
        CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) <= 12
        THEN 210
        ELSE 
          CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) <= 24
          THEN 220
          ELSE 
            CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) < 60
            THEN 230
            ELSE 240
            END
          END
        END
      END 
    ELSE -- Gaver
      CASE WHEN (D1.ACTIVE_IN_ANCHOR_FY_MINUS0) = -1
      THEN -- Active
        CASE WHEN (D1.ACTIVE_IN_ANCHOR_FY_MINUS1) = -1
        THEN 
          CASE  WHEN (D1.ACTIVE_IN_ANCHOR_FY_MINUS2) = -1
          THEN -122
          ELSE
            CASE WHEN (D1.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D1.ANCHOR_FY) -1
            THEN -121
            ELSE -123
            END
          END
        ELSE
          CASE WHEN (D1.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D1.ANCHOR_FY)
          THEN -110
          ELSE -130
          END
        END
      ELSE  --Lapsed
        CASE WHEN DATEDIFF(month, (D1.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 12
        THEN -210
        ELSE 
          CASE WHEN DATEDIFF(month, (D1.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 24
          THEN -220
          ELSE 
            CASE WHEN DATEDIFF(month, (D1.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) < 60
            THEN -230
            ELSE -240
            END
          END
        END
      END
    END AS [FILTER_ANCHOR1_GIVER]

  , CASE WHEN (D2.FISHING_HARD_FIRST_DATEOFPAYMENT) IS NULL OR DATEDIFF(day, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) < 0
    THEN
      CASE WHEN C1.CONTACT_CREATED IS NULL
      THEN 0
      ELSE
        CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) <= 12
        THEN 210
        ELSE 
          CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) <= 24
          THEN 220
          ELSE 
            CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) < 60
            THEN 230
            ELSE 240
            END
          END
        END
      END 
    ELSE
      CASE WHEN (D2.ACTIVE_IN_ANCHOR_FY_MINUS0) = -1
      THEN
        CASE WHEN (D2.ACTIVE_IN_ANCHOR_FY_MINUS1) = -1
        THEN 
          CASE  WHEN (D2.ACTIVE_IN_ANCHOR_FY_MINUS2) = -1
          THEN -122
          ELSE
            CASE WHEN (D2.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D2.ANCHOR_FY) -1
            THEN -121
            ELSE -123
            END
          END
        ELSE
          CASE WHEN (D2.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D2.ANCHOR_FY)
          THEN -110
          ELSE -130
          END
        END
      ELSE
        CASE WHEN DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 12
        THEN -210
        ELSE 
          CASE WHEN DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 24
          THEN -220
          ELSE 
            CASE WHEN DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) < 60
            THEN -230
            ELSE -240
            END
          END
        END
      END
    END AS [FILTER_ANCHOR2_GIVER]

  -- , (D3.FISHING_SOFT_FIRST_DATEOFPAYMENT) AS [SOFT1]
  -- , (D4.FISHING_SOFT_FIRST_DATEOFPAYMENT) AS [SOFT2]

  , CASE WHEN (D3.FISHING_SOFT_FIRST_DATEOFPAYMENT) IS NULL THEN 0 ELSE -1 END AS [FILTER_ANCHOR1_SOFT]
  , CASE WHEN (D4.FISHING_SOFT_FIRST_DATEOFPAYMENT) IS NULL THEN 0 ELSE -1 END AS [FILTER_ANCHOR2_SOFT]

--   , C1.PRIMARYCATEGORY
--   , C1.DONOTMAILREASON
--   , C1.GENERATION_ABBREVATION
  , C1.STATECOUNTRY
  , C1.FILTER_GENDER
  , C1.FILTER_ORGANISATION
  , C1.FILTER_MAJDONOR
  , C1.FILTER_ANONYMOUS
  , C1.FILTER_DECEASED
  , C1.FILTER_ESTATE
  , C1.FILTER_DONOTMAIL
  , C1.FILTER_EMAIL

--   , C1.FILTER_DONOTCALL
--   , C1.FILTER_TWITTER
--   , C1.FILTER_FACEBOOK
--   , C1.FILTER_LINKEDIN
--   , C1.FILTER_PHONENUMBER
from
  cte_contacts C1
  left join cte_fishing1_hard_payment_date D1 on (C1.SN = D1.SERIALNUMBER)
  left join cte_fishing2_hard_payment_date D2 on (C1.SN = D2.SERIALNUMBER)
  left join cte_fishing1_soft_payment_date D3 on (C1.SN = D3.SN_SOFT)
  left join cte_fishing2_soft_payment_date D4 on (C1.SN = D4.SN_SOFT)
group by
  CASE WHEN (D1.FISHING_HARD_FIRST_DATEOFPAYMENT) IS NULL
    THEN -- NG
      CASE WHEN C1.CONTACT_CREATED IS NULL OR DATEDIFF(day, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) < 0
      THEN 0
      ELSE
        CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) <= 12
        THEN 210
        ELSE
          CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) <= 24
          THEN 220
          ELSE
            CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE1) < 60
            THEN 230
            ELSE 240
            END
          END
        END
      END
    ELSE -- Gaver
      CASE WHEN (D1.ACTIVE_IN_ANCHOR_FY_MINUS0) = -1
      THEN -- Active
        CASE WHEN (D1.ACTIVE_IN_ANCHOR_FY_MINUS1) = -1
        THEN
          CASE  WHEN (D1.ACTIVE_IN_ANCHOR_FY_MINUS2) = -1
          THEN -122
          ELSE
            CASE WHEN (D1.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D1.ANCHOR_FY) -1
            THEN -121
            ELSE -123
            END
          END
        ELSE
          CASE WHEN (D1.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D1.ANCHOR_FY)
          THEN -110
          ELSE -130
          END
        END
      ELSE  --Lapsed
        CASE WHEN DATEDIFF(month, (D1.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 12
        THEN -210
        ELSE
          CASE WHEN DATEDIFF(month, (D1.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 24
          THEN -220
          ELSE
            CASE WHEN DATEDIFF(month, (D1.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) < 60
            THEN -230
            ELSE -240
            END
          END
        END
      END
    END

  , CASE WHEN (D2.FISHING_HARD_FIRST_DATEOFPAYMENT) IS NULL OR DATEDIFF(day, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) < 0
    THEN
      CASE WHEN C1.CONTACT_CREATED IS NULL
      THEN 0
      ELSE
        CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) <= 12
        THEN 210
        ELSE
          CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) <= 24
          THEN 220
          ELSE
            CASE WHEN DATEDIFF(month, C1.CONTACT_CREATED, @FISHINGPOOL_DATE2) < 60
            THEN 230
            ELSE 240
            END
          END
        END
      END
    ELSE
      CASE WHEN (D2.ACTIVE_IN_ANCHOR_FY_MINUS0) = -1
      THEN
        CASE WHEN (D2.ACTIVE_IN_ANCHOR_FY_MINUS1) = -1
        THEN
          CASE  WHEN (D2.ACTIVE_IN_ANCHOR_FY_MINUS2) = -1
          THEN -122
          ELSE
            CASE WHEN (D2.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D2.ANCHOR_FY) -1
            THEN -121
            ELSE -123
            END
          END
        ELSE
          CASE WHEN (D2.FISHING_HARD_FIRST_DATEOFPAYMENT_FY) = (D2.ANCHOR_FY)
          THEN -110
          ELSE -130
          END
        END
      ELSE
        CASE WHEN DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 12
        THEN -210
        ELSE
          CASE WHEN DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) <= 24
          THEN -220
          ELSE
            CASE WHEN DATEDIFF(month, (D2.FISHING_HARD_LAST_DATEOFPAYMENT), @FISHINGPOOL_DATE1) < 60
            THEN -230
            ELSE -240
            END
          END
        END
      END
    END


  , CASE WHEN (D3.FISHING_SOFT_FIRST_DATEOFPAYMENT) IS NULL THEN 0 ELSE -1 END
  , CASE WHEN (D4.FISHING_SOFT_FIRST_DATEOFPAYMENT) IS NULL THEN 0 ELSE -1 END

--   , C1.PRIMARYCATEGORY
--   , C1.DONOTMAILREASON
--   , C1.GENERATION_ABBREVATION
  , C1.STATECOUNTRY
  , C1.FILTER_GENDER
  , C1.FILTER_ORGANISATION
  , C1.FILTER_MAJDONOR
  , C1.FILTER_ANONYMOUS
  , C1.FILTER_DECEASED
  , C1.FILTER_ESTATE
  , C1.FILTER_DONOTMAIL
  , C1.FILTER_EMAIL

--   , C1.FILTER_DONOTCALL
--   , C1.FILTER_TWITTER
--   , C1.FILTER_FACEBOOK
--   , C1.FILTER_LINKEDIN
--   , C1.FILTER_PHONENUMBER