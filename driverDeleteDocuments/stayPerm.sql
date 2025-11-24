CREATE PROCEDURE stayPerm
(	
	@doc_type nvarchar(50)
)
AS
BEGIN
	DECLARE @docTypeID INT
	SELECT d_doc_type_id = @docTypeID
	FROM DRIVER_DOC_TYPE
	WHERE d_doc_type=@doc_type

	DELETE FROM DRIVER_DOC
	WHERE d_doc_type_id=@docTypeID
END