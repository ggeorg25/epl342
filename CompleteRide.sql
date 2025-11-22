CREATE PROCEDURE sp_CompleteRide
(
    @ride_id INT,
    @driver_id INT
)
AS
BEGIN
    SET NOCOUNT ON;

    --------------------------------------------------------
    -- Validate that the ride is active and belongs to driver
    --------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 
        FROM Ride
        WHERE ride_id = @ride_id
          AND status = 'P' -- in progress
          AND driver_id = @driver_id
    )
    BEGIN
        RAISERROR('Ride cannot be completed. It is not in progress for this driver.', 16, 1);
        RETURN;
    END


    --------------------------------------------------------
    -- Mark ride as completed
    --------------------------------------------------------
    UPDATE Ride
    SET 
        status = 'C',  -- completed
        end_time = GETDATE()
    WHERE ride_id = @ride_id;


    --------------------------------------------------------
    -- Free the driver
    --------------------------------------------------------
    UPDATE Driver
    SET status = 'A'
    WHERE driver_id = @driver_id;


    --------------------------------------------------------
    -- Free the vehicle
    --------------------------------------------------------
    UPDATE Vehicle
    SET isactivev = 0
    WHERE vehicle_id = (
        SELECT vehicle_id 
        FROM Ride 
        WHERE ride_id = @ride_id
    );
END;
GO
