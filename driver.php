<?php
session_start();

require_once 'connect.php';

// JSON + CORS headers
header('Content-Type: application/json');
setCorsHeaders();

try {
    // --- 1. Get users_id from SESSION (or GET as fallback) ---
    $usersId = 0;
    
    if (isset($_SESSION['users_id'])) {
        $usersId = (int) $_SESSION['users_id'];
    } elseif (isset($_GET['users_id'])) {
        $usersId = (int) $_GET['users_id'];
    }

    if ($usersId <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing or invalid users_id (session/GET).'
        ]);
        exit;
    }

    // --- 2. Connect to the database using your Database class ---
    $database = new Database();
    $conn = $database->getConnection();

    if ($conn === null) {
        throw new Exception('Database connection failed. Check connect.php / credentials.');
    }

    // --- 3. Call your stored procedure ---
    // Example SQL Server syntax with PDO:
    $sql = "EXEC getUserFeedback :users_id";

    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':users_id', $usersId, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // --- 4. Return JSON response ---
    echo json_encode([
        'success' => true,
        'count'   => count($rows),
        'data'    => $rows
    ]);

    // optional: close connection (not strictly necessary, but you have the method)
    $database->closeConnection();

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}