const router = require('express').Router();

router.get('/diagnostic', (req, res) => {
  res.render('tools/diagnostic', {
    variant: res.locals.variant,
    visitorId: res.locals.visitorId,
    currentPage: 'diagnostic'
  });
});

router.get('/roi-calculator', (req, res) => {
  res.render('tools/roi-calculator', {
    variant: res.locals.variant,
    visitorId: res.locals.visitorId,
    currentPage: 'roi-calculator'
  });
});

router.get('/wp-download', (req, res) => {
  res.render('tools/wp-download', {
    variant: res.locals.variant,
    visitorId: res.locals.visitorId,
    currentPage: 'wp-download'
  });
});

module.exports = router;
