<?php
header('Content-Type: application/json');
session_start();

// Get driver ID from session or other source
$users_id = $_SESSION['users_id'] ?? null;

if (!$users_id) {
    echo json_encode([
        'success' => false,
        'error' => 'Driver not logged in'
    ]);
    exit;
}

try {
    // SQL Server connection
    $serverName =  "mssql.cs.ucy.ac.cy";
    $database = "eioann09";
    $username = "eioann09";
    $password = "CQxPy3nG";

    $conn = new PDO("sqlsrv:server=$serverName;Database=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Prepare and execute stored procedure
    // Note: In SQL Server, use EXEC to call a stored procedure
    $sql = "{CALL [eioann09].[getDriverRequestsWithInARadius](?)}";
    $stmt = $conn->prepare($sql);
   
    $stmt->bindValue(1, $users_id, PDO::PARAM_INT);
    $stmt->execute(); //calls itself


    // Fetch all results
    $rides = $stmt->fetchAll(PDO::FETCH_ASSOC);


    echo json_encode([
        'success' => true,
        'data' => $rides,
        'count' => count($rides)
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
