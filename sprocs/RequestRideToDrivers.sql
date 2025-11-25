CREATE PROCEDURE RequestRideToDrivers
    @ride_id INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE 
            @pickup_point_id INT,
            @pickup_lat FLOAT,
            @pickup_long FLOAT,
            @geofence_id INT,
            @min_lat FLOAT,
            @max_lat FLOAT,
            @min_long FLOAT,
            @max_long FLOAT,
            @service_id INT;

        ---------------------------------------------------------
        -- 0. Check service_id is 1 or 5 (driver-based services)
        ---------------------------------------------------------
        SELECT @service_id = service_id
        FROM RIDE
        WHERE ride_id = @ride_id;

        IF @service_id NOT IN (1, 5)
        BEGIN
            RAISERROR('This service type does NOT support drivers.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        ---------------------------------------------------------
        -- 1. Get pickup point_id for this ride
        ---------------------------------------------------------
        SELECT @pickup_point_id = point_id
        FROM RIDE_POINT
        WHERE ride_id = @ride_id
          AND start_end = 0;   -- 0 = pickup

        IF @pickup_point_id IS NULL
        BEGIN
            RAISERROR('Pickup point not found for this ride.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        ---------------------------------------------------------
        -- 2. Get pickup coordinates from POINT
        ---------------------------------------------------------
        SELECT 
            @pickup_lat  = latitude,
            @pickup_long = longitude
        FROM POINT
        WHERE point_id = @pickup_point_id;

        IF @pickup_lat IS NULL OR @pickup_long IS NULL
        BEGIN
            RAISERROR('Pickup coordinates not found for this point.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        ---------------------------------------------------------
        -- 3. Find which GEOFENCE rectangle contains this point
        --    (min/max from its 4 GEOPOINT corners)
        ---------------------------------------------------------
        ;;WITH GeofenceBounds AS (
    SELECT 
        gp.geofence_id,
        MIN(p.latitude)  AS min_lat,
        MAX(p.latitude)  AS max_lat,
        MIN(p.longitude) AS min_long,
        MAX(p.longitude) AS max_long
    FROM GEOPOINT gp
    JOIN POINT p ON gp.point_id = p.point_id   -- get coordinates from POINT
    GROUP BY gp.geofence_id
)

        
        SELECT TOP (1)
            @geofence_id = geofence_id,
            @min_lat     = min_lat,
            @max_lat     = max_lat,
            @min_long    = min_long,
            @max_long    = max_long
        FROM GeofenceBounds
        WHERE 
            @pickup_lat  BETWEEN min_lat  AND max_lat
        AND @pickup_long BETWEEN min_long AND max_long;

        IF @geofence_id IS NULL
        BEGIN
            RAISERROR('No geofence contains the pickup point.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        ---------------------------------------------------------
        -- 4. Insert drivers inside the pickup geofence rectangle
        ---------------------------------------------------------
      
        INSERT INTO DRIVER_RIDE (driver_id, ride_id)
        SELECT DP.driver_id, @ride_id
        FROM DRIVER_POINT DP
        JOIN POINT P ON DP.point_id = P.point_id
        WHERE 
            P.latitude  BETWEEN @min_lat  AND @max_lat
        AND P.longitude BETWEEN @min_long AND @max_long;


        ---------------------------------------------------------
        -- 5. Update ride status to Offered
        ---------------------------------------------------------
        UPDATE RIDE
        SET status = 'Offered'
        WHERE ride_id = @ride_id;

        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
