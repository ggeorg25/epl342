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
        alert("Please choose a pickup location on the map.");
        return;
      }

      if (!dropoffLat || !dropoffLng) {
        alert("Please choose a dropoff location on the map.");
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

window.initTaxiMap = function () {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  const defaultCenter = { lat: 35.1264, lng: 33.4299 };

  // Initialize Leaflet map (using map.js function)
  initMap("map", {
    center: defaultCenter,
    zoom: 16
  });

  // Make map global
  const leafletMap = window.map;
  if (!leafletMap) return;

  // Get user location and zoom to it
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // Zoom to user location
        panTo(userPos.lat, userPos.lng, 16);
        
        // Optionally add a marker at user's location
        L.circleMarker([userPos.lat, userPos.lng], {
          radius: 8,
          fillColor: 'blue',
          color: 'darkblue',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6
        }).addTo(leafletMap).bindPopup("Your location");
      },
      (error) => {
        console.warn("Geolocation error:", error);
      }
    );
  }

  let pickupMarker  = null;
  let dropoffMarker = null;

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
      pickupMarker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: 'green',
        color: 'darkgreen',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(leafletMap);

      if (pickupLatInput)  pickupLatInput.value  = lat;
      if (pickupLngInput)  pickupLngInput.value  = lng;
      if (pickupDisplay)   pickupDisplay.value   = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      
      // Auto-switch to dropoff mode
      const dropoffRadio = document.querySelector('input[value="dropoff"]');
      if (dropoffRadio) dropoffRadio.checked = true;

    } else {
      // Remove previous dropoff marker
      if (dropoffMarker) {
        leafletMap.removeLayer(dropoffMarker);
      }

      // Add new dropoff marker (red)
      dropoffMarker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: 'red',
        color: 'darkred',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(leafletMap);

      if (dropoffLatInput) dropoffLatInput.value = lat;
      if (dropoffLngInput) dropoffLngInput.value = lng;
      if (dropoffDisplay)  dropoffDisplay.value  = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  });
};

// Initialize map when page loads
window.addEventListener("load", () => {
  setTimeout(() => {
    window.initTaxiMap();
  }, 100);
});
