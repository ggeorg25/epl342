--InsertVehicleWithCriteria
CREATE PROCEDURE insertVehicleWithCriteria
--Accepts as input the seats,what type of vehicle it is,how much weight it can hold,how it's in the inside and on the outside and what rides it can do
(
	@service_type varchar(100) NOT NULL, --user input to find the service_type_id
	@vehicle_id INT OUTPUT, --this will be outputted to the base
	@seats INT,
	@vehicle_type varchar(30) NOT NULL,
	@license_plate varchar(10) NOT NULL,
	@luggage_volume  numeric(18,0) NOT NULL,
	@photo_interior varbinary(max) NOT NULL,
	@luggage_weight int NOT NULL,
	@photo_exterior varbinary(max) NOT NULL
)

AS
BEGIN
--FROM,WHERE,SELECT set service_type_id from table SERVICE_TYPE where service_type is the type user want and ride_type's id 
--is the service_type_id we want to get
	DECLARE @service_type_id INT
	SELECT @service_type_id = service_type_id
	FROM SERVICE_TYPE
	WHERE @service_type = ride_type
--paei o Driver kai vazei ta stoixeia tou oximatos tou kai apothikevonte ta stixeia mesa stin vasi
INSERT INTO VEHICLE --specifying the columns we want to insert our data in
(
	seats,
	vehicle_type,
	license_plate,
	luggage_volume,
	photo_interior,
	photo_exterior
)
VALUES(
	@seats,
	@vehicle_type,
	@license_plate,
	@luggage_volume,
	@photo_interior,
	@luggage_weight,
	@photo_exterior
)

--epistrefoume to telefteo vehicle_id pou exei mpei stin vasi
if @@ROWCOUNT > 0
	SET @vehicle_id = SCOPE_IDENTITY();
ELSE
	SET @vehicle_id = NULL;
END
GO

