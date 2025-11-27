ALTER PROCEDURE deleteLocation
	@usersID INT

AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @driverID INT
	SELECT @driverID=driver_id
	FROM DRIVER
	WHERE users_id=@usersID --from session

	DELETE   DriverLocation
	WHERE driver_id=@driverID


		UPDATE DRIVER
	SET status='F'
	WHERE driver_id=@driverID
END;
GO

