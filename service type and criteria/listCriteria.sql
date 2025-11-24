--listCriteriaForServiceType SP
 --Makes a list that shows the ID | Ride type
CREATE PROC listCriteria
AS
BEGIN
    SELECT service_type_id,ride_type
    FROM SERVICE_TYPE

END