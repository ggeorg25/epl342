<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

$allowed = ['service','service_type','pickup_lat','pickup_lng','dropoff_lat','dropoff_lng'];

$data = $_POST;

foreach ($allowed as $key) {
    if (isset($data[$key])) {
        // store as-is; front-end already validates presence
        $_SESSION[$key === 'service_type' ? 'selected_service_type' : ($key === 'service' ? 'selected_service' : $key)] = $data[$key];
    }
}

// If the form included a redirect flag (non-AJAX submit), redirect to the PHP page
if (isset($data['redirect']) && $data['redirect']) {
    // redirect to ride_map_options.php
    header('Location: ride_map_options.php');
    exit;
}

echo json_encode(['success' => true]);

?>
