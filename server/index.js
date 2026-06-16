import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Initialize database
import db from './db.js';

// Import routers
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import adminRouter from './routes/admin.js';
import paymentsRouter from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS with support for credentials (cookies)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// HTTP request logger
app.use(morgan('dev'));

// Stripe webhook raw body parser must be defined BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parse incoming JSON and cookies
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(cookieParser());

// Base API route
app.get('/api/health', (req, res) => {
  try {
    // Check database connection
    const row = db.prepare('SELECT 1 as alive').get();
    if (row && row.alive === 1) {
      return res.status(200).json({
        status: 'success',
        message: 'ShipKit API is healthy and database is connected.',
        timestamp: new Date().toISOString()
      });
    }
    throw new Error('Database ping failed');
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'API is healthy but database is down.',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Auth routes
app.use('/api/auth', authRouter);

// User Profile & Account Settings routes
app.use('/api/users', usersRouter);

// Stripe payments routes
app.use('/api/payments', paymentsRouter);

// Admin Panel CRUD routes
app.use('/api/admin', adminRouter);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));
  
  // HTML5 pushstate routing support (redirect all other routes to React app index.html)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Friendly dev welcome message
  app.get('/', (req, res) => {
    res.send('Welcome to ShipKit Backend (Development Mode). Run client dev server to view the frontend.');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Bind to 0.0.0.0 to expose to all network interfaces (publicly accessible)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(` ShipKit Server is running!`);
  console.log(` Port: ${PORT}`);
  console.log(` Bind: 0.0.0.0 (All interfaces)`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});
