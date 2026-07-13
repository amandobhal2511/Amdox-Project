/**
 * Server Entry Point
 * Starts the Express server and handles graceful shutdown
 */
const app = require('./app');
const config = require('./config/env');
const { pool } = require('./config/database');
const authService = require('./services/authService');

const PORT = config.port;

async function start() {
  try {
    // Fail fast if DB credentials are wrong / DB is down
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('========================================');
    console.error('  Failed to connect to PostgreSQL');
    console.error(`  ${err.message}`);
    console.error('  Check your backend/.env DB_* values.');
    console.error('========================================');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log('========================================');
    console.log('  AI Cloud ERP Suite API');
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Server running on port ${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log('========================================');
  });

  // Cleanup expired sessions every hour
  const sessionCleanupInterval = setInterval(async () => {
    try {
      const count = await authService.cleanupExpiredSessions();
      if (count > 0) {
        console.log(`Cleaned up ${count} expired session(s)`);
      }
    } catch (err) {
      console.error('Session cleanup error:', err.message);
    }
  }, 60 * 60 * 1000);

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    clearInterval(sessionCleanupInterval);

    server.close(async () => {
      console.log('HTTP server closed');
      await pool.end();
      console.log('Database pool closed');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });
}

start();
