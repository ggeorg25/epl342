CREATE TRIGGER approveVehicle{
ON VEHICLE_DOC
AFTER INSERT AS 
DECLARE @typeNum INT,@flag INT
SET @typeNum=10
	@flag=1

while(@typeNum < 15)
{
if exists( 
SELECT status
FROM VEHICLE_DOC 
WHERE v_doc_type_id = @typeNum AND vehicle_id=@vehicleID

@flag=0

}

if(@flag=1){
BEGIN
UPDATE VEHICLE
SET STATUS = 'A'
WHERE vehicle_id = @vehicle_id
END
}