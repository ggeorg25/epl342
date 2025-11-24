use eioann09
GO

--insertCriteriaForServiceType SP
CREATE PROC insertCriteriaForServiceType
    --criteria for ride_type_id 
AS 
BEGIN
    --1
    INSERT INTO CRITERIA (seats_c, luggage_weight_c, luggage_volume_c, service_type_id)
    SELECT
    4,
    200,
    400,
    SERVICE_TYPE.service_type_id --this will project the id that the criteria meets using the ride_type
    FROM SERVICE_TYPE
    WHERE SERVICE_TYPE.ride_type=(N'Απλή διαδρομή επιβάτη');

    --2
    INSERT INTO CRITERIA (seats_c, luggage_weight_c, luggage_volume_c, service_type_id)
    SELECT
    4 ,
    250,
    450,
    SERVICE_TYPE.service_type_id --projects the id
    FROM SERVICE_TYPE
    WHERE SERVICE_TYPE.ride_type=(N'Πολυτελής διαδρομή επιβάτη');

    --3
    INSERT INTO CRITERIA (seats_c, luggage_weight_c, luggage_volume_c, service_type_id)
    SELECT
    2,
    600,
    3000,
    SERVICE_TYPE.service_type_id --projects the id
    FROM SERVICE_TYPE
    WHERE SERVICE_TYPE.ride_type=(N'Μεταφορά ελαφριού οικιακού φορτίου');
    
    --4
    INSERT INTO CRITERIA (seats_c, luggage_weight_c, luggage_volume_c, service_type_id)
    SELECT
    2,
    1200,
    6000,
    SERVICE_TYPE.service_type_id --projects the id
    FROM SERVICE_TYPE
    WHERE SERVICE_TYPE.ride_type=(N'Μεταφορά μεγάλου οικιακού φορτίου');

    --5
    INSERT INTO CRITERIA(seats_c ,luggage_weight_c, luggage_volume_c, service_type_id)
    SELECT
    4,
    150,
    300,
    SERVICE_TYPE.service_type_id --projects id
    FROM SERVICE_TYPE
    WHERE SERVICE_TYPE.ride_type=(N'Μεταφορά με ενδιάμεση σημεία');
    
END
