CREATE PROCEDURE driverDocumentsApproval
(
	@approved BIT, --button
	@picture nvarchar(1000),
	@users_id INT
)
AS
BEGIN
	IF @approved = 1
	INSERT INTO DRIVER
		(
		picture,
		registration_date,
		status_d,
		users_id
		
		)
	VALUES
	(
	@picture, --see later
	SYSDATETIME(),
	'approved',
	@users_id
	)

	ELSE
	BEGIN
		DELETE FROM DRIVER_DOC
		WHERE users_id = @users_id
	END
END