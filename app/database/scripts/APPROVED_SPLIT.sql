SELECT
  SUM(B1.PAYMENTAMOUNT) AS TOTAL
  , B1.CREATEDBY, B1.CREATED, B1.SERIALNUMBER, B1.SOURCECODE, B1.SOURCECODE2, B1.DESTINATIONCODE, B1.DESTINATIONCODE2
  , B2.ENVELOPESALUTATION AS CONTACT, B2.PAYMENTTYPE
FROM
  TBL_BATCHITEMSPLIT    B1
  LEFT JOIN TBL_BATCHITEM   B2 ON (B1.SERIALNUMBER = B2.SERIALNUMBER) AND (B1.RECEIPTNO = B2.RECEIPTNO) AND (B1.ADMITNAME = B2.ADMITNAME)
  LEFT JOIN TBL_BATCHHEADER  B4 ON (B1.ADMITNAME = B4.ADMITNAME)
  LEFT JOIN TBL_OBJECT  O ON (B1.ADMITNAME = O.ADMITNAME)
  LEFT JOIN TBL_STAGE   S ON (O.STAGEID = S.STAGEID)
WHERE
  (B2.REVERSED IS NULL OR NOT(B2.REVERSED=1 OR B2.REVERSED=-1))
  AND (S.STAGE = 'Batch Approved')
  AND B4.APPROVED > DATEADD(dd,-1,GETDATE())
GROUP BY
  B1.CREATEDBY, B1.CREATED, B1.SERIALNUMBER, B1.SOURCECODE, B1.SOURCECODE2, B1.DESTINATIONCODE, B1.DESTINATIONCODE2
  , B2.ENVELOPESALUTATION, B2.PAYMENTTYPE
ORDER BY
  SUM(B1.PAYMENTAMOUNT)  DESC
