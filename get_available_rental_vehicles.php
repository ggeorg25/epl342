<?php
session_start();
require 'connect.php';

header('Content-Type: application/json');

$json = trim(file_get_contents("php://input"));
$data = json_decode($json);

if ($data === null) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
}

$service_type_id = isset($data->service_type_id) ? intval($data->service_type_id) : null;
$rental_start = isset($data->rental_start) ? $data->rental_start : null;
$rental_end = isset($data->rental_end) ? $data->rental_end : null;

if (!$service_type_id || !$rental_start || !$rental_end) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required parameters: service_type_id, rental_start, rental_end'
    ]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Call stored procedure to get available rental vehicles
    $sql = "{CALL [eioann09].[GetAvailableRentalVehicles](?, ?, ?)}";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(1, $service_type_id, PDO::PARAM_INT);
    $stmt->bindParam(2, $rental_start, PDO::PARAM_STR);
    $stmt->bindParam(3, $rental_end, PDO::PARAM_STR);
    $stmt->execute();
    
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    echo json_encode([
        'status' => 'success',
        'vehicles' => $vehicles,
        'count' => count($vehicles)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
