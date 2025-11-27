CREATE PROCEDURE CreateRideRequest
    @pickup_point_id INT,
    @dropoff_point_id INT,
    @service_id INT,
    @service_type_id INT,
    @vehicle_type_id INT,
    @rider_users_id INT,
    @estimated_price DECIMAL(10,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        ---------------------------------------------------------
        -- 0. Check if user already has a pending ride request
        ---------------------------------------------------------
        IF EXISTS (SELECT 1 FROM RIDEREQUEST WHERE users_id = @rider_users_id AND status = 'Pending')
        BEGIN
            RAISERROR('You already have a pending ride request. Please cancel it before creating a new one.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        ---------------------------------------------------------
        -- 1. Check service_id is valid (adjust range as needed)
        ---------------------------------------------------------
        IF @service_id NOT BETWEEN 6 AND 10
        BEGIN
            RAISERROR('This service type does NOT support drivers.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        ---------------------------------------------------------
        -- 2. Create a single RIDEREQUEST entry without driver_id
        --    Driver will be assigned when someone accepts
        ---------------------------------------------------------
        INSERT INTO RIDEREQUEST 
        (
            request_time,
            response_time,
            status,
            vehicle_type_requested,
            users_id,
            pickup_point_id,
            dropoff_point_id,
            is_ride_now
        )
        VALUES
        (            
            GETDATE(),
            NULL,
            'Pending',              -- status: Pending until driver accepts
            @vehicle_type_id,
            @rider_users_id,
            @pickup_point_id,
            @dropoff_point_id,
            0
        );

        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
