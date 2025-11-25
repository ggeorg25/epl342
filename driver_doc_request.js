function showSignupMessage(message, type) {
    const alertBox = document.getElementById('alert');
    const alertText = document.getElementById('alert-text');
  
    if (alertBox && alertText) {
      alertText.textContent = message;
      alertBox.style.display = 'block';
      alertBox.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
      alertBox.style.color = type === 'success' ? '#155724' : '#721c24';
      alertBox.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    } else {
      alert(message);
    }
  }
  
  // Validate file size
  function validateFileSize(fileInput, maxSizeMB, fileName) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      return { valid: false, message: `${fileName}: No file selected` };
    }
    
    const file = fileInput.files[0];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        message: `${fileName} is ${fileSizeMB}MB. Maximum allowed is ${maxSizeMB}MB.`
      };
    }
    
    return { valid: true };
  }
  
  // Validate dates
  function validateDates(issueDate, expirationDate, docName, checkOneMonth = false) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!issueDate) {
      return { valid: false, message: `${docName}: Issue date is required` };
    }
    
    const issue = new Date(issueDate);
    issue.setHours(0, 0, 0, 0);
    
    if (issue > today) {
      return {
        valid: false,
        message: `${docName}: Issue date cannot be in the future.`
      };
    }
    
    if (checkOneMonth) {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      if (issue < oneMonthAgo) {
        return {
          valid: false,
          message: `${docName}: Issue date must not be older than 1 month.`
        };
      }
    }
    
    if (expirationDate) {
      const exp = new Date(expirationDate);
      exp.setHours(0, 0, 0, 0);
      
      if (exp <= today) {
        return {
          valid: false,
          message: `${docName}: Expiration date must be later than today.`
        };
      }
      
      if (exp <= issue) {
        return {
          valid: false,
          message: `${docName}: Expiration date must be later than issue date.`
        };
      }
    }
    
    return { valid: true };
  }
  function submitDriverDocsRequest() {
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('driverVehicleForm');
  
    if (!submitBtn || !form) {
      console.error('submitBtn or form not found');
      return;
    }
  
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking...';
  
    try {
      // Validate driver picture
      const driverPictureInput = document.getElementById('driver_picture');
      const driverPictureValidation = validateFileSize(driverPictureInput, 2, 'Driver Picture');
      if (!driverPictureValidation.valid) {
        showSignupMessage(driverPictureValidation.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue';
        return;
      }
  
      // Define required documents with mapping to indices
      const docMappings = [
        { // Index 0: ID/Passport
          name: 'ID/Passport',
          codeId: 'id_doc_code',
          dateId: 'id_doc_publish',
          expId: 'id_doc_exp',
          fileId: 'id_doc_file',
          checkOneMonth: false,
          required: true
        },
        { // Index 1: Residence Permit (optional)
          name: 'Residence Permit',
          codeId: 'res_permit_code',
          dateId: 'res_permit_publish',
          expId: 'res_permit_exp',
          fileId: 'res_permit_file',
          checkOneMonth: false,
          required: false
        },
        { // Index 2: Driving License
          name: 'Driving License',
          codeId: 'dl_code',
          dateId: 'dl_publish',
          expId: 'dl_exp',
          fileId: 'dl_file',
          checkOneMonth: false,
          required: true
        },
        { // Index 3: Criminal Record
          name: 'Criminal Record',
          codeId: 'cr_code',
          dateId: 'cr_publish',
          expId: null,
          fileId: 'cr_file',
          checkOneMonth: true,
          required: true
        },
        { // Index 4: Medical Certificate
          name: 'Medical Certificate',
          codeId: 'med_code',
          dateId: 'med_publish',
          expId: 'med_exp',
          fileId: 'med_file',
          checkOneMonth: false,
          required: true
        },
        { // Index 5: Psychological Certificate
          name: 'Psychological Certificate',
          codeId: 'psy_code',
          dateId: 'psy_publish',
          expId: 'psy_exp',
          fileId: 'psy_file',
          checkOneMonth: false,
          required: true
        }
      ];
  
      // Validate all documents
      for (const doc of docMappings) {
        const code = document.getElementById(doc.codeId)?.value.trim();
        const issueDate = document.getElementById(doc.dateId)?.value;
        const expirationDate = doc.expId ? document.getElementById(doc.expId)?.value : null;
        const fileInput = document.getElementById(doc.fileId);
        const hasFile = fileInput?.files && fileInput.files.length > 0;
        
        const hasAnyData = code || issueDate || expirationDate || hasFile;
  
        // Skip optional documents if no data provided
        if (!doc.required && !hasAnyData) {
          continue;
        }
  
        if (doc.required || hasAnyData) {
          if (!code) {
            showSignupMessage(`Please fill in document code for ${doc.name}.`, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
            return;
          }
  
          // Validate file size
          const fileValidation = validateFileSize(fileInput, 2, doc.name);
          if (!fileValidation.valid) {
            showSignupMessage(fileValidation.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
            return;
          }
  
          // Validate dates
          const dateValidation = validateDates(issueDate, expirationDate, doc.name, doc.checkOneMonth);
          if (!dateValidation.valid) {
            showSignupMessage(dateValidation.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
            return;
          }
        }
      }
  
      // All validations passed - create FormData with proper structure
      console.log('Creating FormData...');
      const formData = new FormData();
  
      // Add driver picture
      const driverPictureFile = driverPictureInput.files[0];
      if (driverPictureFile) {
        formData.append('driver_picture', driverPictureFile);
      }
  
      // Add driver_id if it exists in the form
      const driverIdInput = document.getElementById('driver_id');
      if (driverIdInput && driverIdInput.value) {
        formData.append('driver_id', driverIdInput.value);
      }
  
      // Add each document in the nested structure PHP expects
      docMappings.forEach((doc, index) => {
        const code = document.getElementById(doc.codeId)?.value.trim();
        const issueDate = document.getElementById(doc.dateId)?.value;
        const expirationDate = doc.expId ? document.getElementById(doc.expId)?.value : '';
        const fileInput = document.getElementById(doc.fileId);
        const hasFile = fileInput?.files && fileInput.files.length > 0;
  
        const hasAnyData = code || issueDate || expirationDate || hasFile;
  
        // Only add if required or if there's any data
        if (doc.required || hasAnyData) {
          formData.append(`driver_docs[${index}][doc_code]`, code || '');
          formData.append(`driver_docs[${index}][d_doc_publish_date]`, issueDate || '');
          formData.append(`driver_docs[${index}][d_doc_ex_date]`, expirationDate || '');
          
          if (hasFile) {
            formData.append(`driver_docs[${index}][image_pdf]`, fileInput.files[0]);
          }
        }
      });
  
      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [File] ' + pair[1].name + ' (' + pair[1].size + ' bytes)');
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }
  
      console.log('Sending request...');
  
      fetch('driver_doc_request.php', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          console.log('Response received:', response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(text => {
          console.log('Server response:', text);
          
          if (text.includes('<b>') || text.includes('Fatal error') || text.includes('Warning')) {
            console.error('PHP Error:', text);
            showSignupMessage('Server error. Please check console for details.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
            return;
          }
  
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error('Invalid JSON:', text);
            showSignupMessage('Server returned invalid response.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
            return;
          }
  
          if (data.status === 'success') {
            showSignupMessage(data.message || 'Driver documents submitted successfully!', 'success');
            setTimeout(() => {
              window.location.href = 'vehicle_request.html';
            }, 1500);
          } else {
            showSignupMessage(data.message || 'Submission failed.', 'error');
            if (data.debug) {
              console.log('Debug info:', data.debug);
            }
          }
  
          submitBtn.disabled = false;
          submitBtn.textContent = 'Continue';
        })
        .catch(error => {
          console.error('Fetch error details:', error);
          showSignupMessage('Upload error: ' + error.message, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Continue';
        });
  
    } catch (error) {
      console.error('Validation error:', error);
      showSignupMessage('Form validation error: ' + error.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continue';
    }
  }
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('Submit button clicked');
      submitDriverDocsRequest();
    });
  
    
