
document.addEventListener("DOMContentLoaded", () => {
  const demoEl = document.getElementById("demo");


  const storedUsername   = localStorage.getItem("username") || "User";
  const navbarUsernameEl = document.getElementById("navbar-username");
  const heroUsernameEl   = document.getElementById("hero-username");

  if (navbarUsernameEl) navbarUsernameEl.textContent = storedUsername;
  if (heroUsernameEl)   heroUsernameEl.textContent   = storedUsername;

//link:https://www.w3schools.com/html/html5_geolocation.asp#:~:text=Using%20HTML%20Geolocation%20API&text=The%20getCurrentPosition()%20method%20is%20used%20to%20return%20the%20user's%20current%20location.
  window.getLocation = function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    } else if (demoEl) {
      demoEl.innerHTML = "Geolocation is not supported by this browser.";
    }
  };

  function geoSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    if (demoEl) {
      demoEl.innerHTML = "Latitude: " + lat + "<br>Longitude: " + lng;
    }


    if (window.map) {
      panTo(lat, lng);
    }
  }

  function geoError() {
    alert("Sorry, no position available.");
  }


  const form = document.getElementById("taxi-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const service     = document.querySelector('input[name="service"]:checked')?.value;
      const serviceType = document.getElementById("service_type").value;

      const pickupLat   = document.getElementById("pickup_lat").value;
      const pickupLng   = document.getElementById("pickup_lng").value;
      const dropoffLat  = document.getElementById("dropoff_lat").value;
      const dropoffLng  = document.getElementById("dropoff_lng").value;

      if (!pickupLat || !pickupLng) {
        showLocationPopup("pickup");
        return;
      }

      if (!dropoffLat || !dropoffLng) {
        showLocationPopup("dropoff");
        return;
      }

      // send values to server-side session and then redirect to PHP page
      const body = new URLSearchParams();
      body.append('service', service);
      body.append('service_type', serviceType);
      body.append('pickup_lat', pickupLat);
      body.append('pickup_lng', pickupLng);
      body.append('dropoff_lat', dropoffLat);
      body.append('dropoff_lng', dropoffLng);

      fetch('set_session.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
      .then(res => res.json())
      .then(resp => {
        if (resp && resp.success) {
          window.location.href = 'ride_map_options.php';
        } else {
          alert('Could not save session on server. Try again.');
        }
      })
      .catch(err => {
        console.error('Session save error', err);
        alert('Network error saving session.');
      });
    });
  }
});

function showLocationPopup(type) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;';
  
  const popup = document.createElement('div');
  popup.style.cssText = 'background:white; padding:30px; border-radius:15px; box-shadow:0 4px 20px rgba(0,0,0,0.3); max-width:400px; text-align:center;';
  
  const title = type === 'pickup' ? 'Pickup Location Required' : 'Dropoff Location Required';
  const message = type === 'pickup' 
    ? 'Please click on the map to set your pickup location.' 
    : 'Please click on the map to set your dropoff location.';
  
  popup.innerHTML = `
    <h3 style="margin:0 0 15px 0; color:#ff9800; font-size:22px;">📍 ${title}</h3>
    <p style="margin:0 0 25px 0; color:#666; font-size:16px;">${message}</p>
    <button id="location-ok" style="padding:12px 40px; background:#0066ff; color:white; border:none; border-radius:8px; font-size:16px; cursor:pointer; font-weight:600;">
      OK
    </button>
  `;
  
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  document.getElementById('location-ok').onclick = () => {
    document.body.removeChild(overlay);
    
    // Switch to the appropriate mode
    const modeRadio = document.querySelector(`input[value="${type}"]`);
    if (modeRadio) modeRadio.checked = true;
  };
}

window.initTaxiMap = function () {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  const defaultCenter = { lat: 35.1264, lng: 33.4299 };

  // Initialize Leaflet map
  initMap("map", {
    center: defaultCenter,
    zoom: 16
  });

  // Make map global
  const leafletMap = window.map;

  // Get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // Zoom to user location
        panTo(userPos.lat, userPos.lng, 16);
        
        // Add marker at user's current location
        L.marker([userPos.lat, userPos.lng]).addTo(leafletMap).bindPopup("Your Location").openPopup();
      },
      (error) => {
        console.warn("Geolocation error:", error);
      }
    );
  }

  let pickupMarker  = null;
  let dropoffMarker = null;

  // Make markers accessible globally for clear function
  window.pickupMarker = null;
  window.dropoffMarker = null;

  const pickupLatInput   = document.getElementById("pickup_lat");
  const pickupLngInput   = document.getElementById("pickup_lng");
  const dropoffLatInput  = document.getElementById("dropoff_lat");
  const dropoffLngInput  = document.getElementById("dropoff_lng");

  const pickupDisplay = document.getElementById("pickup_display");
  const dropoffDisplay = document.getElementById("dropoff_display");

  // Handle map click
  leafletMap.on("click", (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    const clickModeEl = document.querySelector('input[name="clickMode"]:checked');
    const mode = clickModeEl ? clickModeEl.value : "pickup";

    if (mode === "pickup") {
      // Remove previous pickup marker
      if (pickupMarker) {
        leafletMap.removeLayer(pickupMarker);
      }

      // Add new pickup marker (green)
      const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      pickupMarker = L.marker([lat, lng], {icon: greenIcon}).addTo(leafletMap);
      window.pickupMarker = pickupMarker;

      if (pickupLatInput)  pickupLatInput.value  = lat;
      if (pickupLngInput)  pickupLngInput.value  = lng;
      if (pickupDisplay)   pickupDisplay.value   = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      
      // Auto-switch to dropoff mode only if we don't already have a dropoff
      if (!window.dropoffMarker) {
        const dropoffRadio = document.querySelector('input[value="dropoff"]');
        if (dropoffRadio) dropoffRadio.checked = true;
      }

    } else {
      // If no pickup marker exists, switch to pickup mode and set pickup instead
      if (!window.pickupMarker) {
        const pickupRadio = document.querySelector('input[value="pickup"]');
        if (pickupRadio) {
          pickupRadio.checked = true;
        }
        
        // Add pickup marker
        const greenIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        pickupMarker = L.marker([lat, lng], {icon: greenIcon}).addTo(leafletMap);
        window.pickupMarker = pickupMarker;

        if (pickupLatInput)  pickupLatInput.value  = lat;
        if (pickupLngInput)  pickupLngInput.value  = lng;
        if (pickupDisplay)   pickupDisplay.value   = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        
        // DON'T auto-switch back to dropoff - let user see pickup is selected
        
        return;
      }
      
      // Remove previous dropoff marker
      if (dropoffMarker) {
        leafletMap.removeLayer(dropoffMarker);
      }

      // Add new dropoff marker (red)
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      dropoffMarker = L.marker([lat, lng], {icon: redIcon}).addTo(leafletMap);
      window.dropoffMarker = dropoffMarker;

      if (dropoffLatInput) dropoffLatInput.value = lat;
      if (dropoffLngInput) dropoffLngInput.value = lng;
      if (dropoffDisplay)  dropoffDisplay.value  = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  });
};

// Navigation button functions
window.clearAllPoints = function() {
  const leafletMap = window.map;
  if (!leafletMap) return;
  
  // Remove markers if they exist
  if (window.pickupMarker) {
    leafletMap.removeLayer(window.pickupMarker);
    window.pickupMarker = null;
  }
  if (window.dropoffMarker) {
    leafletMap.removeLayer(window.dropoffMarker);
    window.dropoffMarker = null;
  }
  
  // Clear form inputs
  const pickupLatInput = document.getElementById('pickup_lat');
  const pickupLngInput = document.getElementById('pickup_lng');
  const dropoffLatInput = document.getElementById('dropoff_lat');
  const dropoffLngInput = document.getElementById('dropoff_lng');
  const pickupDisplay = document.getElementById('pickup_display');
  const dropoffDisplay = document.getElementById('dropoff_display');
  
  if (pickupLatInput) pickupLatInput.value = '';
  if (pickupLngInput) pickupLngInput.value = '';
  if (dropoffLatInput) dropoffLatInput.value = '';
  if (dropoffLngInput) dropoffLngInput.value = '';
  if (pickupDisplay) pickupDisplay.value = '';
  if (dropoffDisplay) dropoffDisplay.value = '';
  
  // Reset to pickup mode
  const pickupRadio = document.querySelector('input[value="pickup"]');
  if (pickupRadio) pickupRadio.checked = true;
};

window.returnToUserLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        panTo(lat, lng, 16);
      },
      (error) => {
        alert('Unable to get your location. Please enable location services.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
};

// Call initTaxiMap when page loads
window.addEventListener("load", () => {
  setTimeout(() => {
    window.initTaxiMap();
  }, 100);
});
