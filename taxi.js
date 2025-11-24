
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
      window.map.setCenter({ lat, lng });
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

      localStorage.setItem("selected_service", service);
      localStorage.setItem("selected_service_type", serviceType);
      localStorage.setItem("pickup_lat", pickupLat);
      localStorage.setItem("pickup_lng", pickupLng);
      localStorage.setItem("dropoff_lat", dropoffLat);
      localStorage.setItem("dropoff_lng", dropoffLng);

      window.location.href = "ride_map_options.html";
    });
  }
});

window.initMap = function () {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  const defaultCenter = { lat: 35.1264, lng: 33.4299 };

  const map = new google.maps.Map(mapDiv, {
    zoom: 16,
    center: defaultCenter,
  });

  
  window.map = map;

 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userPos);
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

  map.addListener("click", (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const clickModeEl = document.querySelector('input[name="clickMode"]:checked');
    const mode = clickModeEl ? clickModeEl.value : "pickup";

    if (mode === "pickup") {
      if (pickupMarker) pickupMarker.setMap(null);

      pickupMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
      });

      if (pickupLatInput)  pickupLatInput.value  = lat;
      if (pickupLngInput)  pickupLngInput.value  = lng;
      if (pickupDisplay)   pickupDisplay.value   = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      // ★ Auto-switch from pickup → dropoff
const dropoffRadio = document.querySelector('input[value="dropoff"]');
if (dropoffRadio) dropoffRadio.checked = true;

    } else {
      if (dropoffMarker) dropoffMarker.setMap(null);

      dropoffMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
      });

      if (dropoffLatInput) dropoffLatInput.value = lat;
      if (dropoffLngInput) dropoffLngInput.value = lng;
      if (dropoffDisplay)  dropoffDisplay.value  = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  });
};
