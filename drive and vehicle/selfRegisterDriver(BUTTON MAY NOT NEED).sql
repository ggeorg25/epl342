CREATE PROCEDURE selfRegisterDriver
(
	--use userID to identify driverID and make driverID a new userID and then store the documents he provided
	@userID INT,
	@doc_code nvarchar(50),
	@d_doc_publish_date DATE,
	@d_doc_exp_date DATE,
	@image_pdf varbinary(max)
)
AS
BEGIN
	EXEC getFilesF
END