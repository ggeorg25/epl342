// Configuration
const API_URL = 'driver.php';

// DOM Elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const resultsContainer = document.getElementById('resultsContainer');

// Fetch driver requests from API (users_id comes from PHP session)
async function fetchDriverRequests() {
    hideMessages();
    showLoading(true);
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Get response as text first for debugging
        const responseText = await response.text();

        // Log raw response for debugging
        console.log('Raw Response:', responseText);

        // Try to parse JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            showLoading(false);
            showError('Server returned invalid JSON. Check console for details.');
            console.error('JSON Parse Error:', parseError);
            console.error('Response was:', responseText);
            return;
        }

        showLoading(false);

        if (data.success) {
            if (data.count > 0) {
                showSuccess(`Found ${data.count} request${data.count !== 1 ? 's' : ''}`);
                displayRequests(data.data);
            } else {
                displayNoRequests();
            }
        } else {
            showError(data.message || 'Failed to fetch driver requests');
        }

    } catch (error) {
        showLoading(false);
        showError(`Error: ${error.message}`);
        console.error('Fetch error:', error);
    }
}

// Display requests in cards
function displayRequests(requests) {
    const grid = document.createElement('div');
    grid.className = 'requests-grid';

    requests.forEach(request => {
        const card = createRequestCard(request);
        grid.appendChild(card);
    });

    resultsContainer.appendChild(grid);
}

// Create a single request card
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';

    const statusClass = request.status === 'Pending' ? 'status-pending' : 'status-accepted';

    card.innerHTML = `
        <span class="status-badge ${statusClass}">${escapeHtml(request.status)}</span>

        <div class="request-header">
            <div class="request-id">Ride #${escapeHtml(request.ride_id)}</div>
        </div>

        <div class="request-detail">
            <span class="detail-label">📍 Pickup:</span>
            <span class="detail-value">${formatGeoPoint(request.pickup_lat)}</span>
        </div>

        <div class="request-detail">
            <span class="detail-label">🎯 Dropoff:</span>
            <span class="detail-value">${formatGeoPoint(request.dropoff_lat)}</span>
        </div>

        <div class="request-detail">
            <span class="detail-label">🚗 Vehicle Type:</span>
            <span class="detail-value">${escapeHtml(request.vehicle_type_id)}</span>
        </div>

        <div class="request-detail">
            <span class="detail-label">🕐 Request Time:</span>
            <span class="detail-value">${formatDateTime(request.request_time)}</span>
        </div>

        ${request.response_time ? `
        <div class="request-detail">
            <span class="detail-label">✅ Response Time:</span>
            <span class="detail-value">${formatDateTime(request.response_time)}</span>
        </div>
        ` : ''}
    `;

    return card;
}

// Display message when no requests found
function displayNoRequests() {
    resultsContainer.innerHTML = `
        <div class="no-requests">
            <div class="no-requests-icon">📭</div>
            <h3>No Requests Found</h3>
            <p>There are no pending or accepted ride requests for this driver.</p>
        </div>
    `;
}

// Format GeoPoint data
function formatGeoPoint(geoPoint) {
    if (!geoPoint) {
        return 'N/A';
    }

    if (typeof geoPoint === 'string') {
        return geoPoint;
    }

    return 'Location data available';
}

// Format datetime
function formatDateTime(dateTime) {
    if (!dateTime) {
        return 'N/A';
    }

    try {
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return dateTime;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
        return '';
    }

    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Show loading indicator
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';

    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// Hide all messages
function hideMessages() {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
}

// Load requests on page load (users_id comes from the session)
window.addEventListener('DOMContentLoaded', () => {
    fetchDriverRequests();
});
