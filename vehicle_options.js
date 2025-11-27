// Custom popup function
function showCustomPopup(message, isError = false) {
  const popup = document.createElement('div');
  popup.className = 'custom-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 400px;
    text-align: center;
  `;
  
  popup.innerHTML = `
    <p style="margin: 0 0 20px 0; font-size: 16px; color: ${isError ? '#d32f2f' : '#333'};">${message}</p>
    <button onclick="this.parentElement.remove()" style="
      background: #1e3a5f;
      color: white;
      border: none;
      padding: 10px 30px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    ">OK</button>
  `;
  
  document.body.appendChild(popup);
}

document.addEventListener('DOMContentLoaded', () => {
  const storedUsername = localStorage.getItem('username') || 'User';
  const navbarUsernameEl = document.getElementById('navbar-username');
  if (navbarUsernameEl) navbarUsernameEl.textContent = storedUsername;
});

window.addEventListener("load", () => {
  setTimeout(() => {
    initMap();
  }, 100);
});

function initMap() {
  const mapDiv = document.getElementById("map");
  if (!mapDiv || typeof L === 'undefined') {
    console.error('Map div or Leaflet not available');
    return;
  }

  const cyprusCenter = { lat: 35.1264, lng: 33.4299 };

  // Initialize Leaflet map
  const map = L.map('map').setView([cyprusCenter.lat, cyprusCenter.lng], 10);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Get user location and zoom to it
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Zoom to user location
        map.setView([userLat, userLng], 13);
        
        // Add marker at user's location
        L.marker([userLat, userLng])
          .addTo(map)
          .bindPopup("Your Location")
          .openPopup();
      },
      (error) => {
        console.warn("Geolocation error:", error);
        // Stay at Cyprus center if geolocation fails
      }
    );
  }

  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  // Fetch rental vehicle data
  fetchRentalVehicles(map);
}

function fetchRentalVehicles(map) {
  // Get rental details from PHP session via a simple GET endpoint
  fetch('get_rental_session.php')
    .then(res => res.json())
    .then(sessionData => {
      console.log('Session data received:', sessionData);
      console.log('service_type:', sessionData.service_type);
      console.log('rental_start:', sessionData.rental_start);
      console.log('rental_end:', sessionData.rental_end);
      
      if (!sessionData.service_type || !sessionData.rental_start || !sessionData.rental_end) {
        console.error('Missing data - service_type:', sessionData.service_type, 'rental_start:', sessionData.rental_start, 'rental_end:', sessionData.rental_end);
        showCustomPopup('Missing rental information. Please go back and fill in all details.', true);
        return;
      }

      // Fetch available vehicles
      return fetch('get_available_rental_vehicles.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type_id: parseInt(sessionData.service_type),
          rental_start: sessionData.rental_start,
          rental_end: sessionData.rental_end
        })
      });
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'error') {
        console.error('Error:', data.message);
        showCustomPopup('Error loading vehicles: ' + data.message, true);
        return;
      }

      if (!data.vehicles || data.vehicles.length === 0) {
        showCustomPopup('No vehicles available for the selected criteria.', true);
        return;
      }

      // Add markers for each vehicle
      data.vehicles.forEach(vehicle => {
        const lat = parseFloat(vehicle.current_lat);
        const lng = parseFloat(vehicle.current_lng);

        if (!lat || !lng) return;

        // Create custom icon for rental vehicles
        const vehicleIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker([lat, lng], { icon: vehicleIcon }).addTo(map);

        // Create popup content
        const popupContent = `
          <div class="vehicle-popup">
            <h3>${vehicle.vehicle_type_name}</h3>
            <p><strong>Model:</strong> ${vehicle.model || 'N/A'}</p>
            <p><strong>Year:</strong> ${vehicle.year || 'N/A'}</p>
            <p><strong>Color:</strong> ${vehicle.color || 'N/A'}</p>
            <p><strong>Plate:</strong> ${vehicle.license_plate || 'N/A'}</p>
            <button class="select-btn" onclick="selectVehicle(${vehicle.vehicle_id}, '${vehicle.vehicle_type_name}')">
              Select This Vehicle
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      // Fit map to show all markers
      if (data.vehicles.length > 0) {
        const bounds = data.vehicles
          .filter(v => v.current_lat && v.current_lng)
          .map(v => [parseFloat(v.current_lat), parseFloat(v.current_lng)]);
        
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      showCustomPopup('Network error loading vehicles.', true);
    });
}

function selectVehicle(vehicleId, vehicleName) {
  console.log('Selected vehicle:', vehicleId, vehicleName);
  
  // Save selected vehicle to session
  fetch('set_session.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `selected_vehicle_id=${encodeURIComponent(vehicleId)}`
  })
  .then(r => r.json())
  .then(() => {
    showCustomPopup(`Vehicle ${vehicleName} selected! Proceeding to confirmation...`);
    // TODO: Redirect to rental confirmation page
    // window.location.href = 'rental_confirm.php';
  })
  .catch(err => {
    console.error('Session save error:', err);
    showCustomPopup('Error saving selection.', true);
  });
}

