CREATE PROCEDURE getVehicleData
AS 
BEGIN
	DECLARE @currentdate DATE = getDate()
	SELECT vehicle_id,vehicle_doc_id,image_pdf
	FROM VEHICLE_DOC
	WHERE v_doc_publish_date < v_doc_exp_date
	AND v_doc_exp_date <= @currentdate

END