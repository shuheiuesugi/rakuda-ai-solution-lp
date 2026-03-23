/**
 * RAKUDA AI SOLUTION - Contact Modal
 * Opens / closes the contact form modal and submits data to /api/contact
 */

/**
 * Open the contact modal and reset form visibility.
 */
function openContact() {
  var modal = document.getElementById('contactModal');
  if (!modal) return;

  // Reset visibility
  var formArea = document.getElementById('contactFormArea');
  var completeArea = document.getElementById('contactComplete');
  if (formArea) {
    formArea.classList.remove('is-hide');
    formArea.classList.add('is-show');
  }
  if (completeArea) {
    completeArea.classList.remove('is-show');
    completeArea.classList.add('is-hide');
  }

  // Reset form fields
  var fields = ['cCompany', 'cName', 'cEmail', 'cPhone', 'cSize', 'cMessage'];
  fields.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Show modal
  modal.classList.add('is-open');
  document.body.classList.add('modal-open');

  if (typeof trackEvent === 'function') {
    trackEvent('contact_open');
  }
}

/**
 * Close the contact modal.
 */
function closeContact() {
  var modal = document.getElementById('contactModal');
  if (!modal) return;

  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}

/**
 * Submit the contact form via POST /api/contact.
 * @param {Event} e - form submit event
 */
function submitContact(e) {
  if (e) e.preventDefault();

  var data = {
    company: (document.getElementById('cCompany') || {}).value || '',
    name: (document.getElementById('cName') || {}).value || '',
    email: (document.getElementById('cEmail') || {}).value || '',
    phone: (document.getElementById('cPhone') || {}).value || '',
    employee_count: (document.getElementById('cSize') || {}).value || '',
    message: (document.getElementById('cMessage') || {}).value || '',
  };

  // Basic validation
  if (!data.name || !data.email) {
    alert('お名前とメールアドレスは必須です。');
    return;
  }

  var submitBtn = document.querySelector('#contactFormArea button[type="submit"], #contactFormArea .btn-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/contact', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      // Show completion state
      var formArea = document.getElementById('contactFormArea');
      var completeArea = document.getElementById('contactComplete');
      if (formArea) {
        formArea.classList.remove('is-show');
        formArea.classList.add('is-hide');
      }
      if (completeArea) {
        completeArea.classList.remove('is-hide');
        completeArea.classList.add('is-show');
      }

      if (typeof trackEvent === 'function') {
        trackEvent('contact_submit', { company: data.company });
      }
    } else {
      alert('送信に失敗しました。もう一度お試しください。');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
      }
    }
  };
  xhr.onerror = function () {
    alert('通信エラーが発生しました。インターネット接続をご確認ください。');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }
  };
  xhr.send(JSON.stringify(data));
}

// ── Click overlay to close ───────────────────────────────────────────
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('contact-modal')) {
    closeContact();
  }
});

// ── Escape key to close ──────────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeContact();
  }
});
