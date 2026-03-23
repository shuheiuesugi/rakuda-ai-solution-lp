require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// A/B test + tracking middleware
const abtest = require('./src/middleware/abtest');
const { trackPageView } = require('./src/middleware/tracking');
app.use(abtest);
app.use(trackPageView);

// Routes
app.use('/', require('./src/routes/lp'));
app.use('/api', require('./src/routes/api'));
app.use('/tools', require('./src/routes/tools'));
app.use('/admin', require('./src/routes/admin'));

app.listen(PORT, () => {
  console.log(`RAKUDA AI SOLUTION LP running on http://localhost:${PORT}`);
});
