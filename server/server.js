/**
 * ===========================================
 * LinkVerse — Main Express Server Entry Point
 * ===========================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const dns = require('dns');

// Load environment variables FIRST — before any config imports
dotenv.config();

// 🔧 DNS Fix — resolve MongoDB Atlas SRV records reliably
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Config & Middleware imports
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const linkRoutes = require('./routes/links');
const socialRoutes = require('./routes/socials');
const themeRoutes = require('./routes/theme');
const analyticsRoutes = require('./routes/analytics');
const seoRoutes = require('./routes/seo');
const paymentRoutes = require('./routes/payment');
const publicRoutes = require('./routes/public');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');

const app = express();

// ===========================================
// Core Middleware
// ===========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());

// Only log HTTP requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting on all /api routes
app.use('/api', apiLimiter);

// ===========================================
// Health Check
// ===========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LinkVerse API is running 🚀',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ===========================================
// API Routes
// ===========================================

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/socials', socialRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// ===========================================
// 404 Handler
// ===========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===========================================
// Global Error Handler (must be last)
// ===========================================

app.use(errorHandler);

// ===========================================
// Start Server with Graceful Shutdown
// ===========================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const mongoose = require('mongoose');

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('');
    console.log('===========================================');
    console.log('🔗 LinkVerse API Server');
    console.log('===========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log('===========================================');
    console.log('');
  });

  // Graceful shutdown handler
  const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      console.log('🔒 HTTP server closed');

      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed');
      } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err.message);
      }

      console.log('👋 LinkVerse server shut down cleanly');
      process.exit(0);
    });

    // Force shutdown if graceful shutdown takes too long
    setTimeout(() => {
      console.error('❌ Forced shutdown — graceful shutdown timed out');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();

module.exports = app;