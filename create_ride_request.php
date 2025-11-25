<?php

require 'connect.php';  

header('Content-Type: application/json');

$json = trim(file_get_contents("php://input"));
$data = json_decode($json);

if ($data === null) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
}

// Required parameters
$rider_users_id   = isset($data->users_id) ? intval($data->users_id) : null;
$service_id       = isset($data->service_id) ? intval($data->service_id) : null;
$service_type_id  = isset($data->service_type_id) ? intval($data->service_type_id) : null;
$vehicle_type_id  = isset($data->vehicle_type_id) ? intval($data->vehicle_type_id) : null;

// Point IDs (should be created before this step)
$pickup_point_id  = isset($data->pickup_point_id) ? intval($data->pickup_point_id) : null;
$dropoff_point_id = isset($data->dropoff_point_id) ? intval($data->dropoff_point_id) : null;

// Optional parameters
$estimated_price = isset($data->estimated_price) ? floatval($data->estimated_price) : null;

// Validate required inputs
if ($rider_users_id === null || $service_id === null || $service_type_id === null || 
    $vehicle_type_id === null || $pickup_point_id === null || $dropoff_point_id === null) {
    
    echo json_encode([
        'status'  => 'error',
        'message' => 'Missing required parameters: users_id, service_id, service_type_id, vehicle_type_id, pickup_point_id, dropoff_point_id.'
    ]);
    exit;
}

try {
    $db   = new Database();
    $conn = $db->getConnection();

    // ===================================================================
    // STEP 1: Create the ride request
    // ===================================================================
    $sql = "{CALL [eioann09].[CreateRideRequest](?, ?, ?, ?, ?, ?, ?, ?)}";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(1, $rider_users_id, PDO::PARAM_INT);
    $stmt->bindParam(2, $service_id, PDO::PARAM_INT);
    $stmt->bindParam(3, $service_type_id, PDO::PARAM_INT);
    $stmt->bindParam(4, $vehicle_type_id, PDO::PARAM_INT);
    $stmt->bindParam(5, $pickup_point_id, PDO::PARAM_INT);
    $stmt->bindParam(6, $dropoff_point_id, PDO::PARAM_INT);
    $stmt->bindParam(7, $estimated_price, PDO::PARAM_STR);
    $stmt->bindParam(8, $new_ride_id, PDO::PARAM_INT, 4000);
    
    $stmt->execute();
    $stmt->closeCursor();

    if ($new_ride_id === null) {
        throw new Exception('Failed to create ride request.');
    }

    // ===================================================================
    // STEP 2: Request ride to available drivers
    // ===================================================================
    $sql = "{CALL [eioann09].[RequestRideToDrivers](?)}";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(1, $new_ride_id, PDO::PARAM_INT);
    
    $stmt->execute();
    $stmt->closeCursor();

    // ===================================================================
    // SUCCESS: Return ride details
    // ===================================================================
    echo json_encode([
        'status'           => 'success',
        'message'          => 'Ride request created and sent to available drivers.',
        'ride_id'          => $new_ride_id,
        'ride_status'      => 'Offered'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    
    // Check if it's a SQL Server error with a custom message
    $errorInfo = $e->errorInfo;
    $errorMessage = 'Unexpected error while creating ride request.';
    
    if (isset($errorInfo[2])) {
        // Extract the actual error message from SQL Server
        $errorMessage = $errorInfo[2];
    }
    
    echo json_encode([
        'status'  => 'error',
        'message' => $errorMessage
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
}
?>