CREATE PROCEDURE insertDriverDoc
(
	@doc_type nvarchar(50) NOT NULL,
	@doc_code nvarchar(50) NOT NULL,
	@d_doc_publish_date DATE NOT NULL,
	@d_doc_ex_date DATE NULL,
	@image_pdf varbinary(max) NOT NULL
)
AS
BEGIN
	DECLARE @d_doc_type_id INT
	SELECT @d_doc_type_id=d_doc_type_id
	FROM DRIVER_DOC_TYPE
	WHERE d_doc_type=@doc_type


INSERT INTO DRIVER_DOC
(
	doc_code,
	d_doc_publish_date,
	d_doc_ex_date,
	image_pdf
	d_doc_type_id
)
VALUES
(
@doc_code,
@d_doc_publish_date,
@d_doc_ex_date,
@image_pdf
@d_doc_type_id
)

END
