CREATE PROCEDURE insertVehicleDoc
(
	@v_doc_type nvarchar(50) NOT NULL,
	@v_doc_exp_date date NOT NULL,
	@file varbinary(max) NOT NULL,
	@v_doc_publish_date DATE NOT NULL
	--tha kserosume to vehicle_id me to driver_id to opio exei arxisi ena session gia na valei auta ta pramata mesa
)
AS 
BEGIN
	DECLARE @v_doc_type_id INT
	SELECT @v_doc_type_id=v_doc_type_id
	FROM VEHICLE_DOC_TYPE
	WHERE v_doc_type=@v_doc_type
	
INSERT INTO VEHICLE_DOC
	(
	v_doc_exp_date,
	image_pdf,
	v_doc_publish_date,
	v_doc_type_id
	)
VALUES
	(
	@v_doc_exp_date,
	@file,
	@v_doc_publish_date,
	@v_doc_type_id
	)
END	