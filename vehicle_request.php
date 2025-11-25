<?php
session_start();
header('Content-Type: application/json');

require_once 'connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$users_id = $_SESSION['users_id'] ?? null;

if ($users_id === null) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$service_type   = $_POST['service_type'] ?? null;
$vehicle_type   = $_POST['vehicle_type'] ?? null;
$license_plate  = $_POST['license_plate'] ?? null;
$seats          = $_POST['seats'] ?? null;
$luggage_volume = $_POST['luggage_volume'] ?? null;
$luggage_weight = $_POST['luggage_weight'] ?? null;

if (!$service_type || !$vehicle_type || !$license_plate) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$photoInterior = $_FILES['photo_interior'] ?? null;
$photoExterior = $_FILES['photo_exterior'] ?? null;

if (!$photoInterior || $photoInterior['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Interior photo required']);
    exit;
}

if (!$photoExterior || $photoExterior['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Exterior photo required']);
    exit;
}

$interiorName = $photoInterior['name'];
$exteriorName = $photoExterior['name'];

$sql = "{CALL [eioann09].[registerDriverWithVehicle](?,?,?,?,?,?,?,?,?,?)}";

try {
    $db   = new Database();
    $conn = $db->getConnection();
    $stmt = $conn->prepare($sql);

    $stmt->bindValue(1,  null,                    PDO::PARAM_NULL);
    $stmt->bindValue(2,  (int)$users_id,          PDO::PARAM_INT);
    $stmt->bindValue(3,  (int)$service_type,      PDO::PARAM_INT);
    $stmt->bindValue(4,  (int)$seats,             PDO::PARAM_INT);
    $stmt->bindValue(5,  (int)$vehicle_type,      PDO::PARAM_INT);
    $stmt->bindValue(6,  $license_plate,          PDO::PARAM_STR);
    $stmt->bindValue(7,  (int)$luggage_volume,    PDO::PARAM_INT);
    $stmt->bindValue(8,  (int)$luggage_weight,    PDO::PARAM_INT);
    $stmt->bindValue(9,  $interiorName,           PDO::PARAM_STR);
    $stmt->bindValue(10, $exteriorName,           PDO::PARAM_STR);
    
    $stmt->execute();
    
 
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $users_id = $row['vehicle_id'] ?? null;

    if ($row === false) {
        echo json_encode([
            'success' => false, 
            'message' => 'No result returned from stored procedure'
        ]);
        exit;
    }
    
    $vehicle_id = $row['new_vehicle_id'] ?? null;
    $error_message = $row['error_message'] ?? null;
    

    if ($error_message) {
        echo json_encode([
            'success' => false, 
            'message' => $error_message
        ]);
        exit;
    }

    if ($vehicle_id && $vehicle_id > 0) {
        echo json_encode([
            'success' => true, 
            'message' => 'Vehicle registered successfully!',
            'vehicle_id' => $vehicle_id
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Registration failed - vehicle_id is ' . ($vehicle_id ?? 'NULL')
        ]);
    }

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>