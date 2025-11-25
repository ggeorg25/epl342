CREATE PROCEDURE UpdateDriverLocation
(
    @driver_id INT,
    @latitude FLOAT,
    @longitude FLOAT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @newPoint GEOGRAPHY = geography::Point(@latitude, @longitude, 4326);
    DECLARE @now DATETIME = GETDATE();

    --------------------------------------------------------
    -- Step 1: Validate driver exists
    --------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM Driver WHERE driver_id = @driver_id)
    BEGIN
        RAISERROR('Driver does not exist.', 16, 1);
        RETURN;
    END

    --------------------------------------------------------
    -- Step 2: Check if this driver already has a location
    --------------------------------------------------------
    IF EXISTS (SELECT 1 FROM DriverLocation WHERE driver_id = @driver_id)
    BEGIN
        --------------------------------------------------------
        -- Optional optimization: update only every 5 seconds
        --------------------------------------------------------
        IF EXISTS (
            SELECT 1
            FROM DriverLocation
            WHERE driver_id = @driver_id
              AND DATEDIFF(SECOND, last_update, @now) < 4
        )
        BEGIN
            -- Too many updates, ignore to reduce load
            RETURN;
        END

        --------------------------------------------------------
        -- Update existing location
        --------------------------------------------------------
        UPDATE DriverLocation
        SET location = @newPoint,
            last_update = @now
        WHERE driver_id = @driver_id;
    END
    ELSE
    BEGIN
        --------------------------------------------------------
        -- Insert first time location
        --------------------------------------------------------
        INSERT INTO DriverLocation (driver_id, location, last_update)
        VALUES (@driver_id, @newPoint, @now);
    END

END;
GO
