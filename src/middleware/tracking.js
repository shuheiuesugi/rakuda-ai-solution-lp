const db = require('../db');

function trackPageView(req, res, next) {
  const visitorId = res.locals.visitorId || req.cookies.rakuda_visitor;
  const variant = res.locals.variant || req.cookies.rakuda_variant;
  const page = req.path;
  const referrer = req.get('Referer') || '';

  if (visitorId && !page.startsWith('/api/')) {
    try {
      db.prepare(
        'INSERT INTO page_views (visitor_id, page, variant, referrer) VALUES (?, ?, ?, ?)'
      ).run(visitorId, page, variant, referrer);
    } catch (_) { /* silent */ }
  }
  next();
}

function trackConversion(visitorId, eventType, sourceLp, abVariant, metadata) {
  try {
    db.prepare(
      'INSERT INTO conversion_events (visitor_id, event_type, source_lp, ab_variant, metadata) VALUES (?, ?, ?, ?, ?)'
    ).run(visitorId, eventType, sourceLp, abVariant, JSON.stringify(metadata || {}));
  } catch (_) { /* silent */ }
}

module.exports = { trackPageView, trackConversion };
