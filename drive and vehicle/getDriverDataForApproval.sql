CREATE PROCEDURE getDriverDataForApproval
AS 
BEGIN
	DECLARE @currentDate DATE = getDate()
	SELECT users_id,driver_doc_id,image_pdf
	FROM DRIVER_DOC
	WHERE d_doc_publish_date < d_doc_ex_date 
	AND d_doc_ex_date <= @currentDate
END
