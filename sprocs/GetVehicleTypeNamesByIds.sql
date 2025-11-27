CREATE PROCEDURE [eioann09].[GetVehicleTypeNamesByIds]
    @vehicle_type_ids NVARCHAR(MAX)  -- Comma-separated list of IDs like '1,2,3'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Use dynamic SQL to handle IN clause
    DECLARE @sql NVARCHAR(MAX) = N'
    SELECT vehicle_type_id, name 
    FROM [eioann09].[Vehicle_Type] 
    WHERE vehicle_type_id IN (' + @vehicle_type_ids + ')';
    
    EXEC sp_executesql @sql;
END
