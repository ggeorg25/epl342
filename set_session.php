<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

$allowed = ['service','service_type','pickup_lat','pickup_lng','dropoff_lat','dropoff_lng','selected_vehicle_type_id','rental_start','rental_end','selected_vehicle_id'];

$data = $_POST;

foreach ($allowed as $key) {
    if (isset($data[$key])) {
        // Normalize keys for service and service_type, keep others as-is
        if ($key === 'service') {
            $_SESSION['selected_service'] = $data[$key];
        } elseif ($key === 'service_type') {
            $_SESSION['selected_service_type'] = $data[$key];
        } elseif ($key === 'selected_vehicle_type_id') {
            $_SESSION['selected_vehicle_type_id'] = $data[$key];
        } else {
            // Store rental_start, rental_end, etc. directly with their original key names
            $_SESSION[$key] = $data[$key];
        }
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
