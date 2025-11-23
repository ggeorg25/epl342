document.addEventListener('DOMContentLoaded', () => {
  const storedUsername = localStorage.getItem('username') || 'User';

  const navbarUsernameEl = document.getElementById('navbar-username');
  const heroUsernameEl   = document.getElementById('hero-username');

  if (navbarUsernameEl) navbarUsernameEl.textContent = storedUsername;
  if (heroUsernameEl) heroUsernameEl.textContent = storedUsername;
});

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('driverVehicleForm');
  const euCheckbox = document.getElementById('is_eu_resident');
  const resBlock = document.getElementById('residence-permit-block');


  function toggleResidencePermit() {
    if (euCheckbox.checked) {
      resBlock.style.display = 'none';
      resBlock.querySelectorAll('input').forEach(inp => {
        if (inp.type !== 'hidden') inp.required = false;
      });
    } else {
      resBlock.style.display = '';
     
     resBlock.querySelectorAll('input[type="text"],input[type="date"],input[type="file"]').forEach(inp => inp.required = true);
    }
  }

  euCheckbox.addEventListener('change', toggleResidencePermit);
  toggleResidencePermit();

  
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

   
    const crDateInput = document.getElementById('cr_publish');
    if (crDateInput && crDateInput.value) {
      const crDate = new Date(crDateInput.value);
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      if (crDate < oneMonthAgo) {
        e.preventDefault();
        crDateInput.closest('.doc-block').classList.add('doc-block-error');
        alert('Criminal record certificate must not be older than one month.');
      }
    }
  });

  
  const serviceSelect = document.getElementById('service_type');
  const serviceDetailsDiv = document.getElementById('service-type-details');

  function updateServiceTypeDetails() {
    const opt = serviceSelect.options[serviceSelect.selectedIndex];
    const base = opt.getAttribute('data-base');
    const perKm = opt.getAttribute('data-perkm');
    const minFare = opt.getAttribute('data-minfare');
    const maxFare = opt.getAttribute('data-maxfare');

    if (!base) {
      serviceDetailsDiv.textContent = '';
      return;
    }

    serviceDetailsDiv.textContent =
      `Base fare: €${base}, per km: €${perKm}, min fare: €${minFare}, max fare: €${maxFare}`;
  }

  serviceSelect.addEventListener('change', updateServiceTypeDetails);
  updateServiceTypeDetails();
});
