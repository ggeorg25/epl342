--RegisterDriverToServiceCatalog
CREATE PROC registerDriverToService
    @seats int,
    @luggage_weight int,
    @luggage_volume int,
    @service_type nvarchar(100)
AS
BEGIN
    
    SELECT *
    FROM CRITERIA C
    JOIN SERVICE_TYPE S
    ON S.service_type_id = C.service_type_id --Join 2 tables so because we need to check the ride_type that only SERVICE_TYPE has
    --the WHERE checks if everything matches with the 
    --service type the driver wants to be registered in
    WHERE C.seats_c >=@seats
    AND C.luggage_weight_c >= @luggage_weight   
    AND C.luggage_volume_c >= @luggage_volume 
    AND S.ride_type = @service_type --compare string inputted by user with the ride types provided
END