const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  // Page views per variant
  const pvByVariant = db.prepare(`
    SELECT variant, COUNT(*) as views
    FROM page_views
    WHERE variant IS NOT NULL
    GROUP BY variant
  `).all();

  // Conversions per variant + type
  const cvByVariant = db.prepare(`
    SELECT ab_variant as variant, event_type, COUNT(*) as conversions
    FROM conversion_events
    WHERE ab_variant IS NOT NULL
    GROUP BY ab_variant, event_type
  `).all();

  // Total leads
  const totalLeads = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;

  // Total bookings
  const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;

  // Recent leads
  const recentLeads = db.prepare(
    'SELECT * FROM leads ORDER BY created_at DESC LIMIT 20'
  ).all();

  // Recent bookings
  const recentBookings = db.prepare(
    'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 20'
  ).all();

  // Build variant stats
  const variants = ['p1', 'p2', 'p4', 'p9'];
  const variantStats = variants.map(v => {
    const pv = pvByVariant.find(r => r.variant === v);
    const cvs = cvByVariant.filter(r => r.variant === v);
    const totalCv = cvs.reduce((s, c) => s + c.conversions, 0);
    const views = pv ? pv.views : 0;
    return {
      variant: v,
      views,
      conversions: totalCv,
      cvr: views > 0 ? ((totalCv / views) * 100).toFixed(2) : '0.00',
      breakdown: cvs
    };
  });

  res.render('admin/dashboard', {
    variantStats,
    totalLeads,
    totalBookings,
    recentLeads,
    recentBookings,
    currentPage: 'admin'
  });
});

module.exports = router;
