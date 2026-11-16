const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');

const db = new Database(dbPath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

module.exports = db;