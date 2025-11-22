CREATE PROCEDURE DriverRejectRide
(
    @driver_id INT,
    @ride_id INT
)
AS
BEGIN
    SET NOCOUNT ON;

    --------------------------------------------------------
    -- Step 1: Check pending request
    --------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 
        FROM RideRequest
        WHERE driver_id = @driver_id
          AND ride_id = @ride_id
          AND status = 'Pending'
    )
    BEGIN
        RAISERROR('No pending request found for this driver and ride.', 16, 1);
        RETURN;
    END


    --------------------------------------------------------
    -- Step 2: Reject this request
    --------------------------------------------------------
   DELETE FROM RideRequest
    WHERE driver_id = @driver_id
      AND ride_id = @ride_id
      AND status = 'Pending';


  
END;
GO