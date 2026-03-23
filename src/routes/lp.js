const router = require('express').Router();

// Root: A/B test routing
router.get('/', (req, res) => {
  const variant = res.locals.variant || 'p9';
  res.render(`lp/${variant}`, {
    variant,
    visitorId: res.locals.visitorId,
    currentPage: 'home'
  });
});

// Direct LP access (for previewing specific variants)
router.get('/lp/:id', (req, res) => {
  const id = req.params.id;
  const validPages = { '1': 'p1', '2': 'p2', '4': 'p4', '9': 'p9', '10': 'p10' };
  const page = validPages[id];
  if (!page) return res.redirect('/');
  res.render(`lp/${page}`, {
    variant: page,
    visitorId: res.locals.visitorId,
    currentPage: `lp${id}`
  });
});

// Shared pages
router.get('/cases', (req, res) => {
  res.render('shared/cases', {
    variant: res.locals.variant,
    visitorId: res.locals.visitorId,
    currentPage: 'cases'
  });
});

router.get('/resources', (req, res) => {
  res.render('shared/resources', {
    variant: res.locals.variant,
    visitorId: res.locals.visitorId,
    currentPage: 'resources'
  });
});

// Thanks page
router.get('/thanks', (req, res) => {
  const action = req.query.action || 'contact';
  res.render('thanks', {
    variant: res.locals.variant,
    visitorId: res.locals.visitorId,
    currentPage: 'thanks',
    action
  });
});

module.exports = router;
