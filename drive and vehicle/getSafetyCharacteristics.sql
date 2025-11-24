CREATE PROCEDURE getSafetyCharacteristics

@license_plate nvarchar(10)
 AS BEGIN
	DECLARE @vehicleID INT
	SELECT vehicle_id=@vehicleID
	FROM VEHICLE
	WHERE license_plate=@license_plate

	SELECT @license_plate,check_date,comments,official
	FROM SAFETY_CHARACTERISTICS,VERIFIES_VEHICLE
	WHERE @vehicleID = VERIFIES_VEHICLE.vehicle_id AND SAFETY_CHARACTERISTICS.safety_id = VERIFIES_VEHICLE.safety_id



END