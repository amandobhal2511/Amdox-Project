/**
 * Express Application Setup
 * Configures middleware, security, routes, and error handling
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const sessionMiddleware = require('./config/session');
const logger = require('./middleware/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { verifySession } = require('./middleware/sessionVerify');
const apiRoutes = require('./routes');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

console.log(config.cors.origin);
// Request logging
app.use(logger);

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session management
app.use(sessionMiddleware);
app.use(verifySession);

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AI Cloud ERP Suite API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
