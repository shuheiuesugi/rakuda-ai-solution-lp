/**
 * RAKUDA AI SOLUTION - Event Tracking & Scroll Animations
 * Sends conversion events to /api/track (optional)
 * Handles fade-in animations via IntersectionObserver
 */
(function () {
  'use strict';

  // ── Fade-in on scroll ──────────────────────────────────────────────
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
  });

  // ── Event tracking helper ──────────────────────────────────────────
  /**
   * Track a conversion / interaction event.
   * @param {string} eventName - e.g. "cta_click", "form_submit"
   * @param {object} [payload]  - optional extra data
   */
  function trackEvent(eventName, payload) {
    var data = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: location.href,
      referrer: document.referrer || null,
    };
    if (payload) {
      data.payload = payload;
    }

    // Fire-and-forget POST (non-blocking, failures silently ignored)
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/track', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } catch (_) {
      // tracking is optional — never break the page
    }
  }

  // ── Auto-track CTA clicks ─────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) {
      trackEvent(el.getAttribute('data-track'), {
        text: (el.textContent || '').trim().substring(0, 80),
      });
    }
  });

  // Expose globally
  window.trackEvent = trackEvent;
})();
