<?php
session_start();

header('Content-Type: application/json');

echo json_encode([
    'service_type' => $_SESSION['selected_service_type'] ?? null,
    'rental_start' => $_SESSION['rental_start'] ?? null,
    'rental_end' => $_SESSION['rental_end'] ?? null
]);
?>
