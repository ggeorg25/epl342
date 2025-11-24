CREATE PROCEDURE getFiles
(
	@userID INT, --this identifies who submitted the files so we can know
	@d_doc_type nvarchar(50), --this is the type so we can get the id and store it
	@doc_code nvarchar(50),
	@d_doc_publish_date DATE,
	@d_doc_exp_date DATE,
	@image_pdf nvarchar(1000)
)
AS
BEGIN
--pirame to docTypeID gia na kseroume ti doc_type tha kanei submit o user
DECLARE @docTypeID INT;
	SELECT d_doc_type_id=@docTypeID
	FROM DRIVER_DOC_TYPE
	WHERE d_doc_type=@d_doc_type

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
	@doc_code,
	@d_doc_publish_date,
	@d_doc_exp_date,
	@image_pdf,
	@docTypeID
	)
END
--DOES IT CHECK THE DOCTYPE