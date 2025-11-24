CREATE PROCEDURE vehicleDocumentsApproval
(
	@approved BIT, --button
	@userID INT,
	@seats INT,
	@vehicle_type nvarchar(30),
	@license_plate nvarchar(10),
	@luggage_volume,
	@photo_interior,
	@luggage_weight,
	@photo_exterior
)
AS
BEGIN
	IF approved = 1
	INSERT INTO VEHICLE
		(
		seats,
		vehicle_type,
		license_plate,
		luggage_volume,
		photo_interior,
		luggage_weight,
		photo_exterior
		)
	VALUES
		(
		@seats,
		@vehicle_type,
		@license_plate,
		@luggage_volume,
		@photo_interior,
		@luggage_weight,
		@photo_exterior
		)
	ELSE
	BEGIN

END