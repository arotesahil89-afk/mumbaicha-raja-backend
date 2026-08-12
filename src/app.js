import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import awardsRoutes from './routes/awards.js';
import eventsRoutes from './routes/events.js';
import ordersRoutes from './routes/orders.js';
import shippingRoutes from './routes/shipping.js';
import merchandiseRoutes from './routes/merchandise.js';
import adminsRoutes from './routes/admins.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

const allowedOrigins = [
  // Local development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  // Production
  "https://nexbuild-xaee.onrender.com",
  "https://mumbaicharaja.co",
  "https://www.mumbaicharaja.co",
];
// Allow adding more origins via env (comma-separated), e.g. FRONTEND_URL
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(",").map((s) => s.trim()).forEach((o) => {
    if (o && !allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  let corsOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  const bypassPaths = [
    '/api/orders/ccavenue-response',
    '/api/orders/ccavenue-simulator'
  ];

  if (bypassPaths.includes(req.path)) {
    corsOptions.origin = true;
    callback(null, corsOptions);
  } else {
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      corsOptions.origin = true;
      callback(null, corsOptions);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  }
};

app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate)); // explicit preflight handling

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

import { encryptData, decryptData } from './utils/cryptoUtils.js';

// Global Encryption Middleware
app.use((req, res, next) => {
  // 1. Decrypt incoming payload (if present)
  if (req.body && req.body.payload) {
    const decryptedBody = decryptData(req.body.payload);
    if (decryptedBody) {
      req.body = decryptedBody;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid encrypted payload' });
    }
  }

  // 2. Encrypt outgoing responses
  const originalJson = res.json;
  res.json = function (data) {
    // Prevent double encryption and bypass for errors/health if desired
    // For this requirement, we encrypt EVERYTHING except if it's already got a payload wrapper
    if (data && data.payload) {
      return originalJson.call(this, data);
    }
    
    // Some routes return raw buffers or streams, but res.json is for JSON.
    const encryptedText = encryptData(data);
    if (encryptedText) {
      return originalJson.call(this, { payload: encryptedText });
    } else {
      // Fallback if encryption fails
      return originalJson.call(this, data);
    }
  };

  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/shipping_docs', express.static(path.join(__dirname, '../shipping_docs')));
app.use('/api/auth', authRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/merchandise', merchandiseRoutes);
app.use('/api/admins', adminsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
