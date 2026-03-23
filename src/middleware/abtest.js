const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const VARIANTS = ['p1', 'p2', 'p4', 'p9'];
const WEIGHTS = [25, 25, 25, 25]; // equal distribution

function pickVariant() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < VARIANTS.length; i++) {
    rand -= WEIGHTS[i];
    if (rand <= 0) return VARIANTS[i];
  }
  return VARIANTS[VARIANTS.length - 1];
}

function abtest(req, res, next) {
  // Ensure visitor_id cookie
  if (!req.cookies.rakuda_visitor) {
    res.cookie('rakuda_visitor', uuidv4(), {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax'
    });
    req.cookies.rakuda_visitor = res.locals.visitorId = uuidv4();
  }
  res.locals.visitorId = req.cookies.rakuda_visitor;

  // A/B variant assignment
  if (!req.cookies.rakuda_variant) {
    const variant = pickVariant();
    res.cookie('rakuda_variant', variant, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax'
    });
    req.cookies.rakuda_variant = variant;

    // Record assignment
    db.prepare('INSERT INTO ab_assignments (visitor_id, variant) VALUES (?, ?)').run(
      res.locals.visitorId, variant
    );
  }
  res.locals.variant = req.cookies.rakuda_variant;
  next();
}

module.exports = abtest;
