<?php
session_start();

header('Content-Type: application/json');

// Debug - send back the entire session to see what's there
$response = [
    'service_type' => $_SESSION['selected_service_type'] ?? null,
    'rental_start' => $_SESSION['rental_start'] ?? null,
    'rental_end' => $_SESSION['rental_end'] ?? null,
    'debug_full_session' => $_SESSION
];

echo json_encode($response);
?>
