CREATE PROCEDURE DriverAcceptRide
    @driver_id INT,
    @ride_id INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        ----------------------------------------------------
        -- 1. Ensure ride exists and is in OFFERED state
        ----------------------------------------------------
        IF NOT EXISTS (
            SELECT 1 FROM RIDE
            WHERE ride_id = @ride_id AND status = 'O'
        )
        BEGIN
            RAISERROR('Ride is not offered or does not exist.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        ----------------------------------------------------
        -- 2. Ensure driver exists
        ----------------------------------------------------
        IF NOT EXISTS (
            SELECT 1 FROM DRIVER
            WHERE driver_id = @driver_id
        )
        BEGIN
            RAISERROR('Driver does not exist.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        ----------------------------------------------------
        -- 3. Ensure the driver was OFFERED this ride
        ----------------------------------------------------
        IF NOT EXISTS (
            SELECT 1 
            FROM DRIVER_RIDE
            WHERE driver_id = @driver_id
              AND ride_id = @ride_id
        )
        BEGIN
            RAISERROR('Driver was NOT offered this ride.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        ----------------------------------------------------
        -- 4. Accept the ride
        ----------------------------------------------------
        UPDATE RIDE
      SET 
            status = 'A'          -- Assigned  
        WHERE ride_id = @ride_id;
        UPDATE DRIVER
      SET 
            status = 'N'          -- Assigned  
        WHERE driver_id = @driver_id;

        DELETE FROM DRIVER_RIDE
    WHERE (ride_id=@ride_id) AND
    (driver_id!=@driver_id );
        COMMIT;
    END TRY

    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;
GO
