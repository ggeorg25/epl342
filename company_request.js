document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username') || 'User';
  
    const navbarUsernameEl = document.getElementById('navbar-username');
    const heroUsernameEl   = document.getElementById('hero-username');
  
    if (navbarUsernameEl) navbarUsernameEl.textContent = storedUsername;
    if (heroUsernameEl) heroUsernameEl.textContent = storedUsername;
  });
  
form.addEventListener('submit', function (e) {
    const requiredBlocks = document.querySelectorAll('.doc-block[data-required-doc="true"]');
    let valid = true;

    requiredBlocks.forEach(block => {
      block.classList.remove('doc-block-error');
      const requiredInputs = block.querySelectorAll('input[required]');
      requiredInputs.forEach(inp => {
        if (!inp.value) {
          valid = false;
          block.classList.add('doc-block-error');
        }
      });
    });

    if (!valid) {
      e.preventDefault();
      alert('Please fill in all required document fields.');
    }

   // 3) VEHICLE_DOCS
//     $vehicle_docs = $_POST['vehicle_docs'] ?? [];

//     // IMPORTANT: Replace 1,2,3 with the REAL IDs from VEHICLE_DOC_TYPE table
//     $vehicleDocTypes = [
//         0 => 10, // Vehicle Registration
//         1 => 11, // MOT
//         2 => 12  // Vehicle Classification
//     ];

//     $sqlVehicleDoc  = "{CALL [eioann09].[insertVehicleDoc](?,?,?,?,?)}";
//     $stmtVehicleDoc = $conn->prepare($sqlVehicleDoc);

//     foreach ($vehicle_docs as $idx => $doc) {
//         $v_doc_type_id = $vehicleDocTypes[$idx] ?? null;
//         if ($v_doc_type_id === null) {
//             continue;
//         }

//         $pub_date = $doc['v_doc_publish_date'] ?? null;
//         $exp_date = $doc['v_doc_exp_date']     ?? null;
//         $image_path = saveNestedFile('vehicle_docs', $idx, 'image_pdf', 'vehicle_docs');

//         if (!$pub_date || !$image_path) {
//             $conn->rollBack();
//             echo json_encode([
//                 'status'  => 'error',
//                 'message' => "Missing required fields for vehicle document index $idx."
//             ]);
//             exit;
//         }

//         $stmtVehicleDoc->bindValue(1, $new_vehicle_id, PDO::PARAM_INT);
//         $stmtVehicleDoc->bindValue(2, $v_doc_type_id,  PDO::PARAM_INT);
//         $stmtVehicleDoc->bindValue(3, $pub_date,       PDO::PARAM_STR);
//         $stmtVehicleDoc->bindValue(4, $exp_date,       PDO::PARAM_STR);
//         $stmtVehicleDoc->bindValue(5, $image_path,     PDO::PARAM_STR);

//         $stmtVehicleDoc->execute();
//     }

//     $conn->commit();

//     echo json_encode([
//         'status'         => 'success',
//         'message'        => trim($message) ?: 'Driver & vehicle request submitted successfully.',
//         'vehicle_id'     => (int)$new_vehicle_id,
//         'driver_picture' => $driver_picture_path
//     ]);
//     exit;

// } catch (PDOException $e) {
//     if (isset($conn) && $conn->inTransaction()) {
//         $conn->rollBack();
//     }

    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Unexpected error while processing driver & vehicle request.',
        'sqlMessage' => trim($message),
        'debug'   => $e->getMessage(),
        'input'   => $debug_payload   // <-- ΠΟΛΥ ΧΡΗΣΙΜΟ ΤΩΡΑ
    ]);
        
    exit;
}
