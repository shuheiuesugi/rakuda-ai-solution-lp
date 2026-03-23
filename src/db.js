const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './db/rakuda.sqlite';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf-8');
db.exec(schema);

// Seed data if diagnostic_questions is empty
const count = db.prepare('SELECT COUNT(*) as c FROM diagnostic_questions').get();
if (count.c === 0) {
  const seed = fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf-8');
  db.exec(seed);
}

module.exports = db;
