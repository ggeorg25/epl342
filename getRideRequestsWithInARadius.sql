USE [eioann09]
GO

/****** Object:  StoredProcedure [eioann09].[getDriverRequests]    Script Date: 11/26/2025 4:58:06 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [eioann09].[getDriverRequestsWithInARadius]
    @users_id INT --the driver
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @driver_id INT
    SELECT @driver_id = driver_id
    FROM  DRIVER
    WHERE @users_id=users_id

    SELECT U.username,U.phone_number,P.GeoPoint, --check if projects correct GeoPoint
    FROM RIDE R,USERS U,POINT P,DriverLocation Dl
    WHERE U.users_id=R.users_id AND R.pickup_point_id=P.point_id AND @driver_id=Dl.driver_id 
    AND P.GeoPoint.STDistance(Dl.location) < 5000 AND R.users_id=U.users_id
    

END;
GO


