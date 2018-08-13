BEGIN
    DECLARE
    @columns NVARCHAR(MAX),
    @sql NVARCHAR(MAX)

    SELECT  @columns =  STUFF((
                    SELECT  "," + QUOTENAME(CONVERT(VARCHAR(4),IIF(MONTH(t2.DATEOFPAYMENT)<7,YEAR(t2.DATEOFPAYMENT),YEAR(t2.DATEOFPAYMENT)+1)),'')
                    FROM TBL_BATCHITEM AS t2
                    GROUP BY IIF(MONTH(t2.DATEOFPAYMENT)<7,YEAR(t2.DATEOFPAYMENT),YEAR(t2.DATEOFPAYMENT)+1)
                    ORDER BY IIF(MONTH(t2.DATEOFPAYMENT)<7,YEAR(t2.DATEOFPAYMENT),YEAR(t2.DATEOFPAYMENT)+1)
                    FOR XML PATH ('')) ,1,1,NULL)

    SELECT  @sql ='
    SELECT
        SERIALNUMBER, ' + @columns + '
    FROM
        (
        SELECT
            t2.SERIALNUMBER,
            t1.PAYMENTAMOUNT,
            t4.CONTACTTYPE,t4.PRIMARYCATEGORY,
            IIF(MONTH(t2.DATEOFPAYMENT)<7,YEAR(t2.DATEOFPAYMENT),YEAR(t2.DATEOFPAYMENT)+1) AS [FY]
        FROM
            TBL_BATCHITEMSPLIT          AS t1
            LEFT JOIN TBL_BATCHITEM    AS t2 ON (t1.SERIALNUMBER = t2.SERIALNUMBER) AND (t1.RECEIPTNO = t2.RECEIPTNO) AND (t1.ADMITNAME = t2.ADMITNAME)
            LEFT JOIN TBL_BATCHHEADER   AS t3 ON (t2.ADMITNAME = t3.ADMITNAME)
            LEFT JOIN TBL_CONTACT       AS t4 ON (t2.SERIALNUMBER = t4.SERIALNUMBER)
            LEFT JOIN TBL_SOURCECODE    AS t6 ON (t1.SOURCECODE = t6.SOURCECODE)
        WHERE
            (t2.REVERSED is NULL OR NOT(t2.REVERSED=1 OR t2.REVERSED=-1))
            AND (t3.STAGE ="Batch Approved")
            -- AND (t6.SOURCETYPE LIKE "Merchandise%")
            -- AND (t6.SOURCECODE IN ("2ATL117","2ATL16")
        ) AS SourceTable
        -- -------------
        PIVOT
        -- -------------
        (
        SUM(PAYMENTAMOUNT) FOR [FY] IN ( '+ @columns +')
        ) AS PivotTable
    ORDER BY SERIALNUMBER'

    -- PRINT @sql;
    -- EXECUTE(@sql)
    EXEC sp_executesql @sql
END
