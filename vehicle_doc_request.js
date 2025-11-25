// Load username from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (username) {
        const usernameElement = document.getElementById('navbar-username');
        if (usernameElement) {
            usernameElement.textContent = username;
        }
    }
});

// Show alert message function
function showMessage(message, type) {
    const alertBox = document.querySelector('#alert');
    const alertText = document.querySelector('#alert-text');

    if (alertBox && alertText) {
        alertText.textContent = message;
        alertBox.classList.remove('alert-success', 'alert-error');
        alertBox.classList.add(type === 'success' ? 'alert-success' : 'alert-error');
        alertBox.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Main form submission function
function submitVehicleDocuments() {
    const form = document.getElementById('vehicleDocForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Get users_id from localStorage
    const usersId = localStorage.getItem('users_id');
    if (!usersId) {
        showMessage('User ID not found. Please log in again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        return;
    }
    
    // Create FormData object from form
    const formData = new FormData(form);
    
    // Add users_id to formData
    formData.append('users_id', usersId);
    
    // Validate that required files are present
    let hasAllRequiredFiles = true;
    const requiredFileInputs = form.querySelectorAll('input[type="file"][required]');
    
    requiredFileInputs.forEach(input => {
        const file = input.files[0];
        if (!file) {
            hasAllRequiredFiles = false;
            showMessage(`Please upload ${input.getAttribute('data-doc-name') || 'all required documents'}`, 'error');
        }
    });
    
    if (!hasAllRequiredFiles) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        return;
    }
    
    // Send to server using XMLHttpRequest
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        
        if (xhr.status >= 200 && xhr.status < 300) {
            let resp;
            try {
                resp = JSON.parse(xhr.responseText);
            } catch (e) {
                console.error('Invalid JSON from server:', xhr.responseText);
                showMessage('Unexpected response from server.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
                return;
            }
            
            if (resp.status === 'success' || resp.success) {
                showMessage(resp.message || 'Vehicle documents submitted successfully!', 'success');
                
                // Store any returned data
                if (resp.data && resp.data.vehicle_id) {
                    localStorage.setItem('vehicle_id', resp.data.vehicle_id);
                }
                
                // Reset form
                form.reset();
                
                // Redirect to dashboard or next page after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(resp.message || 'Submission failed.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }
        } else {
            console.error('Submission error:', xhr.status, xhr.responseText);
            
            // Try to parse error response
            try {
                const errorResp = JSON.parse(xhr.responseText);
                showMessage(errorResp.message || 'Network/server error. Please try again.', 'error');
            } catch (e) {
                showMessage('Network/server error. Please try again.', 'error');
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    };
    
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            submitBtn.textContent = `Uploading... ${Math.round(percentComplete)}%`;
        }
    };
    
    xhr.onerror = function() {
        showMessage('Network error. Please check your connection and try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    };
    
    xhr.open('POST', 'submit_vehicle_documents.php');
    // DO NOT set Content-Type - let browser set it automatically for multipart/form-data
    xhr.send(formData);
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        submitVehicleDocuments();
    });
});

// Validate date ranges
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('change', function() {
            const section = this.closest('.doc-block');
            if (!section) return;
            
            const publishInput = section.querySelector('input[name*="publish"]');
            const expInput = section.querySelector('input[name*="exp"]');
            
            if (publishInput && expInput && publishInput.value && expInput.value) {
                const publishDate = new Date(publishInput.value);
                const expDate = new Date(expInput.value);
                
                if (expDate <= publishDate) {
                    expInput.setCustomValidity('Expiration date must be after issue date');
                    expInput.reportValidity();
                } else {
                    expInput.setCustomValidity('');
                }
            }
        });
    });
});

// File input validation
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            
            // Check file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                showMessage(`File "${file.name}" is too large. Maximum size is 5MB.`, 'error');
                this.value = '';
                return;
            }
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                showMessage(`File "${file.name}" has invalid type. Please upload JPG, PNG, GIF, or PDF files only.`, 'error');
                this.value = '';
                return;
            }
            
            // Show file name preview (optional)
            const label = this.nextElementSibling;
            if (label && label.classList.contains('file-label')) {
                label.textContent = file.name;
            }
        });
    });
});

// Optional: Add file preview functionality
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            
            // Find preview container if exists
            const previewContainer = this.closest('.doc-block')?.querySelector('.file-preview');
            if (!previewContainer) return;
            
            // Clear previous preview
            previewContainer.innerHTML = '';
            
            // Show preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '200px';
                    img.style.maxHeight = '200px';
                    img.style.marginTop = '10px';
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                const pdfInfo = document.createElement('div');
                pdfInfo.className = 'pdf-info';
                pdfInfo.style.marginTop = '10px';
                pdfInfo.style.padding = '10px';
                pdfInfo.style.backgroundColor = '#f0f0f0';
                pdfInfo.style.borderRadius = '4px';
                pdfInfo.innerHTML = `
                    <strong>PDF Document:</strong> ${file.name}<br>
                    <small>Size: ${(file.size / 1024).toFixed(2)} KB</small>
                `;
                previewContainer.appendChild(pdfInfo);
            }
        });
    });
});

// Optional: Clear form function
function clearForm() {
    const form = document.getElementById('vehicleDocForm');
    if (form) {
        form.reset();
        
        // Clear any file previews
        document.querySelectorAll('.file-preview').forEach(preview => {
            preview.innerHTML = '';
        });
        
        // Reset file labels
        document.querySelectorAll('.file-label').forEach(label => {
            label.textContent = 'Choose file...';
        });
        
        showMessage('Form cleared', 'success');
    }
}

// Optional: Add clear button handler
document.addEventListener('DOMContentLoaded', function() {
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to clear all form data?')) {
                clearForm();
            }
        });
    }
});

// Prevent form submission on Enter key (except in textareas)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('vehicleDocForm');
    if (form) {
        form.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                return false;
            }
        });
    }
});

// Optional: Auto-save to localStorage (draft functionality)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('vehicleDocForm');
    if (!form) return;
    
    // Load draft if exists
    const draft = localStorage.getItem('vehicle_doc_draft');
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            Object.keys(draftData).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input && input.type !== 'file') {
                    input.value = draftData[key];
                }
            });
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
    
    // Save draft on input change
    form.addEventListener('input', function(e) {
        if (e.target.type === 'file') return; // Don't save file inputs
        
        const formData = new FormData(form);
        const draftData = {};
        
        formData.forEach((value, key) => {
            if (typeof value === 'string') {
                draftData[key] = value;
            }
        });
        
        localStorage.setItem('vehicle_doc_draft', JSON.stringify(draftData));
    });
    
    // Clear draft on successful submission
    window.addEventListener('beforeunload', function() {
        // Only clear if form was successfully submitted
        if (submitBtn && submitBtn.disabled && submitBtn.textContent.includes('Success')) {
            localStorage.removeItem('vehicle_doc_draft');
        }
    });
});