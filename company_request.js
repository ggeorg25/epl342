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
