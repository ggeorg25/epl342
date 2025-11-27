ALTER PROCEDURE insertLocation
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

	INSERT INTO  DriverLocation
	VALUES(@driverID,Geography::Point(@latitude,@longitude,4326),SYSDATETIME());

	UPDATE DRIVER
	SET status='N'
	WHERE driver_id=@driverID
END;
GO

