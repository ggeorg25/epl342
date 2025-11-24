CREATE PROCEDURE insertSafetyCharacteristics
(
@license_plate nvarchar(10),
@comments text,
@official nvarchar(50)
)
AS
BEGIN
	DECLARE @vehicleID INT
	SELECT vehicle_id=@vehicleID
	FROM VEHICLE
	WHERE license_plate=@license_plate

	INSERT INTO SAFETY_CHARACTERISTICS
	(
		check_date,
		comments,
		official
	)
	VALUES
	(
	getDate(),
	@comments,
	@official
	)
	DECLARE @safety_id INT
	SET @safety_id = SCOPE_IDENTITY();

	INSERT INTO VERIFIES_VEHICLE
	(
	safety_id
	)
	VALUES
	(
	@safety_id
	)
	

END