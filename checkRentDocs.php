<?php
require 'connect.php';

header('Content-Type: application/json');
session_start();


$json = trim(file_get_contents("php://input"));
$data = json_decode($json);

if ($data === null) {
    $data = new stdClass();
}


$users_id   = $data->users_id   ?? ($_SESSION['users_id']   ?? null);

if ($users_id === null || $users_id === '') {
    echo json_encode([
        'status'   => 'no_docs',
        'message'  => 'We could not find any driver information for your account.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db   = new Database();
    $conn = $db->getConnection();

   
    $driverDocsToCorrect = [];
    $driverStatus = 'no_issues';
    
    $sqlDriver = "{CALL [eioann09].[getDriverDocsResubmit](?)}";
    $stmtDriver = $conn->prepare($sqlDriver);
    $stmtDriver->bindParam(1, $users_id, PDO::PARAM_INT);
    $stmtDriver->execute();
    $driverRows = $stmtDriver->fetchAll(PDO::FETCH_ASSOC);
    $stmtDriver->closeCursor();

    if (!empty($driverRows)) {
        $statusCode = $driverRows[0]['StatusCode'] ?? null;
        
        if ($statusCode === 'SUCCESS') {
            $driverDocsToCorrect = $driverRows;
            $driverStatus = 'has_issues';
        }
    }

    error_log("Driver docs to correct: " . count($driverDocsToCorrect));



    $hasDriverIssues = !empty($driverDocsToCorrect);
  

    if ($hasDriverIssues) {
 
        $messages = [];
        if ($hasDriverIssues) {
            $messages[] = count($driverDocsToCorrect) . " driver document(s) need correction.";
        }
 
        

        echo json_encode([
            'status'        => 'has_issues',
            'message'       => implode(' ', $messages),
            'driverDocs'    => $driverDocsToCorrect,
            'users_id'      => $users_id,
        ], JSON_UNESCAPED_UNICODE);
      
    } else {
        $driverCount=0;
        // Check if they have any documents 
        $sqlCheckDriver = "{CALL ifAnyDriverDocs(?)}";
        $stmtCheck = $conn->prepare($sqlCheckDriver);
        $stmtCheck->bindParam(1, $users_id, PDO::PARAM_INT);
        $stmtCheck->execute(); 
        $driverCount = $stmtCheck->fetch(PDO::FETCH_ASSOC)['DOCS'];
        
      
        if ($driverCount == 0) {
            echo json_encode([
                'status'  => 'no_docs',
                'message' => 'You have not submitted any documents yet.'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'status'  => 'pending',
                'message' => 'All your documents are pending approval or already approved.'
            ], JSON_UNESCAPED_UNICODE);
        }
    }

} catch (PDOException $e) {
    error_log("Database error in checkUsersDocs.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Unexpected error while checking documents.',
        'debug'   => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}