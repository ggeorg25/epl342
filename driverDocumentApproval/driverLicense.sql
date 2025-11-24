CREATE PROCEDURE driverLicense
(	
	@doc_type nvarchar(50),
	@doc_code nvarchar(50),
	@d_doc_publish_date date,
	@d_doc_ex_date date,
	@image_pdf nvarchar(1000)
)
AS
BEGIN
	DECLARE @docTypeID INT
	SELECT d_doc_type_id = @docTypeID
	FROM DRIVER_DOC_TYPE
	WHERE d_doc_type=@doc_type

	INSERT INTO DRIVER_DOC
	(
	doc_code,
	d_doc_publish_date,
	d_doc_ex_date,
	image_pdf,
	d_doc_type_id
	)
	VALUES
	(
	@doc_type,
	@d_doc_publish_date,
	@d_doc_ex_date,
	@image_pdf,
	@docTypeID
	)
END