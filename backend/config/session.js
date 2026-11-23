const session = require('express-session');
const SqliteStore = require('better-sqlite3-session-store')(session);
const path = require('path');

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET is not configured.');
}

const sessionMiddleware = session({
  store: new SqliteStore({
    client: require('better-sqlite3')(
      path.join(__dirname, '../database/sessions.db'),
    ),
    expired: {
      clear: true,
      intervalMs: 15 * 60 * 1000,
    },
  }),
  name: 'store.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
});

module.exports = sessionMiddleware;
