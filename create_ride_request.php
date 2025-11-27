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
    // Validate user exists using stored procedure
    // ===================================================================
    $sql = "{CALL [eioann09].[ValidateUserExists](?, ?)}";
    $stmt = $conn->prepare($sql);
    $userExists = 0;
    $stmt->bindParam(1, $rider_users_id, PDO::PARAM_INT);
    $stmt->bindParam(2, $userExists, PDO::PARAM_INT | PDO::PARAM_INPUT_OUTPUT, 4);
    $stmt->execute();
    $stmt->closeCursor();
    
    if (!$userExists) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid user ID. Please log in again.',
            'debug' => ['users_id' => $rider_users_id]
        ]);
        exit;
    }

    // ===================================================================
    // Create ride request (single RIDEREQUEST entry without driver)
    // ===================================================================
    $sql = "{CALL [eioann09].[CreateRideRequest](?, ?, ?, ?, ?, ?, ?)}";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(1, $pickup_point_id, PDO::PARAM_INT);
    $stmt->bindParam(2, $dropoff_point_id, PDO::PARAM_INT);
    $stmt->bindParam(3, $service_id, PDO::PARAM_INT);
    $stmt->bindParam(4, $service_type_id, PDO::PARAM_INT);
    $stmt->bindParam(5, $vehicle_type_id, PDO::PARAM_INT);
    $stmt->bindParam(6, $rider_users_id, PDO::PARAM_INT);
    $stmt->bindParam(7, $estimated_price, PDO::PARAM_STR);
    
    $executed = $stmt->execute();
    $stmt->closeCursor();

    if (!$executed) {
        throw new Exception('Failed to execute stored procedure');
    }

    // ===================================================================
    // SUCCESS: Return ride details
    // ===================================================================
    http_response_code(200);
    echo json_encode([
        'status'           => 'success',
        'message'          => 'Ride request created. Waiting for driver to accept.',
        'ride_status'      => 'Pending'
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(200); // Change to 200 so JavaScript can read the error
    
    // Check if it's a SQL Server error with a custom message
    $errorInfo = $e->errorInfo;
    $errorMessage = 'Unexpected error while creating ride request.';
    
    if (isset($errorInfo[2])) {
        // Extract the actual error message from SQL Server
        $errorMessage = $errorInfo[2];
    }
    
    echo json_encode([
        'status'  => 'error',
        'message' => $errorMessage,
        'sqlstate' => $errorInfo[0] ?? null,
        'error_code' => $errorInfo[1] ?? null,
        'full_error' => $e->getMessage(),
        'debug'   => [
            'users_id' => $rider_users_id,
            'service_id' => $service_id,
            'service_type_id' => $service_type_id,
            'vehicle_type_id' => $vehicle_type_id,
            'pickup_point_id' => $pickup_point_id,
            'dropoff_point_id' => $dropoff_point_id,
            'estimated_price' => $estimated_price
        ]
    ]);
    exit;
    
} catch (Exception $e) {
    http_response_code(200); // Change to 200 so JavaScript can read the error
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}
?>