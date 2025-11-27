CREATE PROCEDURE updateLocation
	@usersID INT,
	@latitude float,
	@longitude float
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @driverID INT
	SELECT @driverID=driver_id
	FROM DRIVER
	WHERE users_id=@usersID --from session

	UPDATE  DriverLocation
	SET driver_id=@driverID,location=Geography::Point(@latitude,@longitude,4326), last_update=SYSDATETIME();
END;
GO

