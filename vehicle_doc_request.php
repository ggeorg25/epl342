<?php
session_start();
header('Content-Type: application/json');

require_once 'connect.php';

// Ensure POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Auth check
$users_id = $_SESSION['users_id'] ?? null;

if ($users_id === null) {
    http_response_code(401);
    echo json_encode([
        'status'  => 'error',
        'message' => 'User/driver not authenticated.'
    ]);
    exit;
}

try {
    $db   = new Database();
    $conn = $db->getConnection();

    $conn->beginTransaction();

    $vehicle_docs = $_POST['vehicle_docs'] ?? [];

    // Define upload directory
    $uploadDir = __DIR__ . '/uploads/vehicle_docs/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // IMPORTANT: Replace with REAL IDs from VEHICLE_DOC_TYPE table
    $vehicleDocTypes = [
        0 => 10, // Vehicle Registration
        1 => 11, // MOT
        2 => 12  // Vehicle Classification
    ];

    $sqlVehicleDoc  = "{CALL [eioann09].[insertVehicleDoc](?,?,?,?,?)}";
    $stmtVehicleDoc = $conn->prepare($sqlVehicleDoc);

    foreach ($vehicle_docs as $idx => $doc) {
        $v_doc_type_id = $vehicleDocTypes[$idx] ?? null;
        if ($v_doc_type_id === null) {
            continue;
        }

        $pub_date = $doc['v_doc_publish_date'] ?? null;
        $exp_date = $doc['v_doc_exp_date'] ?? null;
        
        // Handle file upload
        $filePath = null;
        $fileInputName = "vehicle_docs_{$idx}_file"; // Match the frontend field name
        
        if (isset($_FILES[$fileInputName]) && $_FILES[$fileInputName]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$fileInputName];
            
            // Validate file
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            
            if ($file['size'] > $maxSize) {
                throw new Exception("File {$file['name']} exceeds 5MB limit");
            }
            
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception("Invalid file type for {$file['name']}");
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueName = uniqid('vdoc_' . $new_vehicle_id . '_' . $v_doc_type_id . '_', true) . '.' . $extension;
            $targetPath = $uploadDir . $uniqueName;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                throw new Exception("Failed to upload file {$file['name']}");
            }
            
            // Store relative path for database
            $filePath = 'uploads/vehicle_docs/' . $uniqueName;
        }

        // Insert document record with file path
        $stmtVehicleDoc->bindValue(1, $new_vehicle_id, PDO::PARAM_INT);
        $stmtVehicleDoc->bindValue(2, $v_doc_type_id,  PDO::PARAM_INT);
        $stmtVehicleDoc->bindValue(3, $pub_date,       PDO::PARAM_STR);
        $stmtVehicleDoc->bindValue(4, $exp_date,       PDO::PARAM_STR);
        $stmtVehicleDoc->bindValue(5, $filePath,       PDO::PARAM_STR); // Store path, not base64

        $stmtVehicleDoc->execute();
    }

    $conn->commit();

    echo json_encode([
        'status'  => 'success',
        'message' => 'Vehicle documents uploaded successfully.'
    ]);
    exit;

} catch (PDOException $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database error while processing vehicle documents.',
        'debug'   => $e->getMessage()
    ]);
    exit;
    
} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}