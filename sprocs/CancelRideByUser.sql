CREATE PROCEDURE CancelRideByUser
(
    @ride_id INT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @driver_id INT;

    SELECT @driver_id = driver_id
    FROM Ride
    WHERE ride_id = @ride_id;


    --------------------------------------------------------
    -- If ride already completed or cancelled, do nothing
    --------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM Ride
        WHERE ride_id = @ride_id
          AND status IN ('Completed', 'Cancelled')
    )
    BEGIN
        RETURN;
    END;


    --------------------------------------------------------
    -- Cancel all pending requests
    --------------------------------------------------------
    DELETE FROM RideRequest
    WHERE ride_id = @ride_id
      AND status = 'Pending';


    --------------------------------------------------------
    -- If a driver was assigned, free them
    --------------------------------------------------------
    IF @driver_id IS NOT NULL
    BEGIN
        UPDATE Driver
        SET status = 'N'
        WHERE driver_id = @driver_id;
    END


    --------------------------------------------------------
    -- Mark ride cancelled
    --------------------------------------------------------
    UPDATE Ride
    SET status = 'Cancelled'
    WHERE ride_id = @ride_id;

     --------------------------------------------------------
    -- Free vehicle
    --------------------------------------------------------
    UPDATE Vehicle
    SET isactivev = 0
    WHERE vehicle_id = (
        SELECT vehicle_id 
        FROM Ride WHERE ride_id = @ride_id)
END;
GO
