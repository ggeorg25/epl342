
document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username') || 'User';
  
    const navbarUsernameEl = document.getElementById('navbar-username');
    const heroUsernameEl   = document.getElementById('hero-username');
  
    if (navbarUsernameEl) navbarUsernameEl.textContent = storedUsername;
    if (heroUsernameEl) heroUsernameEl.textContent = storedUsername;
  });
  
window.initMap = function () {

  const mapDiv = document.getElementById("map");
  const cyprusCenter = { lat: 35.1264, lng: 33.4299 };

  const map = new google.maps.Map(mapDiv, {
    zoom: 8,
    center: cyprusCenter,
  });

  const service = localStorage.getItem("selected_service");
  const service_type = localStorage.getItem("selected_service_type");

  let endpoint = "";

  if (service === "driver") {
    endpoint = "/api/GetAvailableDrivers";  
  } else {
    endpoint = "/api/GetAvailableVehicles";
  }


  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      data.forEach(item => {
        const marker = new google.maps.Marker({
          position: { lat: item.lat, lng: item.lng },
          map: map,
          label: service === "driver" ? "D" : "V"
        });

        const info = new google.maps.InfoWindow({
          content: `
            <div>
              <strong>${service === "driver" ? "Driver" : "Vehicle"} ID:</strong> ${item.driver_id ?? item.vehicle_id}<br>
              <strong>Service Type:</strong> ${service_type}<br>
              <button onclick="selectOption(${item.driver_id ?? item.vehicle_id})">
                Select This ${service === "driver" ? "Driver" : "Vehicle"}
              </button>
            </div>
          `
        });

        marker.addListener("click", () => info.open(map, marker));
      });
    });
};

function selectOption(id) {
  alert("Selected ID: " + id + "\nProceed to pickup location selection.");

}

