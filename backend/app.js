require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const FirebaseSessionStore = require('./sessionStore');

// Import routes and middleware
const authRoutes = require('./routes/auth');
const schoolRoutes = require('./routes/schools');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandlers');

// Create Express app instance
const app = express();

// Trust proxy setting for Render deployment (MUST be before rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://schoolzy-k8g7.onrender.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting (after trust proxy setting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://schoolzy-k8g7.onrender.com',
          'https://schoolzy.com',
          'https://schoolzy.vercel.app',
          'https://schoolzy.netlify.app',
          'https://schoolzy-frontend.onrender.com'
        ]
      : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5500', 'http://localhost:5500'];
    
    console.log('CORS check - Origin:', origin, 'Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      // In development, allow all origins for testing
      if (process.env.NODE_ENV !== 'production') {
        console.log('Allowing origin in development mode');
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Firebase Firestore Session Store
const firebaseSessionStore = new FirebaseSessionStore({
  collection: 'sessions',
  ttl: 7 * 24 * 60 * 60 * 1000 // 1 week TTL
});

// Session configuration with Firebase Firestore store
app.use(session({
  store: firebaseSessionStore,
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'schoolzy_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },
  name: 'schoolzy.sid' // Custom session cookie name
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static file serving with caching
app.use(express.static(path.join(__dirname, '../frontend'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    trustProxy: app.get('trust proxy'),
    cors: {
      origin: req.headers.origin || 'no-origin',
      allowed: true
    },
    firebase: {
      configured: !!process.env.FIREBASE_PROJECT_ID,
      projectId: process.env.FIREBASE_PROJECT_ID || 'not-set'
    }
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      'user-agent': req.headers['user-agent']
    }
  });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Export the Express app for testing
module.exports = app; 