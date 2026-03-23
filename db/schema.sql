-- Leads management
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  employee_count TEXT,
  message TEXT,
  source_lp TEXT,
  ab_variant TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings management
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER REFERENCES leads(id),
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  company TEXT,
  name TEXT,
  email TEXT NOT NULL,
  source_lp TEXT,
  ab_variant TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- A/B test assignments
CREATE TABLE IF NOT EXISTS ab_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Page views
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  page TEXT,
  variant TEXT,
  referrer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conversion events
CREATE TABLE IF NOT EXISTS conversion_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  event_type TEXT,
  source_lp TEXT,
  ab_variant TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Diagnostic questions
CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  category TEXT,
  options TEXT NOT NULL,
  sort_order INTEGER
);

-- Diagnostic results
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  email TEXT,
  answers TEXT NOT NULL,
  score INTEGER,
  level TEXT,
  recommendations TEXT,
  source_lp TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ROI calculations
CREATE TABLE IF NOT EXISTS roi_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  email TEXT,
  inputs TEXT NOT NULL,
  results TEXT NOT NULL,
  source_lp TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
