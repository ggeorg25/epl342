CREATE PROCEDURE Debug_GetAvailableVehicleTypes
(
    @service_type_id INT,
    @latitude FLOAT,
    @longitude FLOAT,
    @search_radius INT = 10000
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @pickup GEOGRAPHY = geography::Point(@latitude, @longitude, 4326);

    SELECT TOP 50
        v.vehicle_id,
        v.vehicle_type_id,
        v.service_type_id,
        v.is_active,
        d.driver_id,
        d.status,
        dl.location.STDistance(@pickup) AS DistanceToPickup,
        dl.location.ToString() AS LocationText
    FROM Vehicle v
    LEFT JOIN Driver d ON d.driver_id = v.driver_id
    LEFT JOIN DriverLocation dl ON dl.driver_id = d.driver_id
  --  WHERE 
   --     v.service_type_id = @service_type_id
    ORDER BY DistanceToPickup ASC;
END;
