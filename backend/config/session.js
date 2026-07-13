/**
 * Express session configuration with PostgreSQL store
 */
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./database');
const config = require('./env');

const sessionMiddleware = session({
  store: new pgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  name: 'erp.sid',
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: config.session.maxAge,
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
  },
});

module.exports = sessionMiddleware;
