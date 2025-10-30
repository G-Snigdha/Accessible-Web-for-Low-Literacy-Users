import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import geminiRoutes from './routes/gemini';

// Import routes
import authRoutes from './routes/auth.js';
import textProcessingRoutes from './routes/textProcessing.js';
import userRoutes from './routes/user.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import healthRoutes from './routes/health.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { validateApiKey } from './middleware/auth.js';

// Import database
import { initializeDatabase } from './database/connection.js';

// Import services
import { initializeServices } from './services/index.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Application Configuration
 */
async function configureApp(): Promise<void> {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      /^chrome-extension:\/\//
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
  };
  app.use(cors(corsOptions));

  // Compression and parsing middleware
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Logging middleware
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }
  app.use(requestLogger);

  // Static files
  app.use('/uploads', express.static(join(__dirname, '../uploads')));
}

/**
 * Route Configuration
 */
function configureRoutes(): void {
  // Health check (no authentication required)
  app.use('/api/health', healthRoutes);

  // Public routes
  app.use('/api/auth', authRoutes);
  
  // Protected routes (require authentication or API key)
  app.use('/api/text', validateApiKey, textProcessingRoutes);
  app.use('/api/user', validateApiKey, userRoutes);
  app.use('/api/analytics', validateApiKey, analyticsRoutes);
  app.use('/api/settings', validateApiKey, settingsRoutes);
  app.use('/api/gemini', geminiRoutes); // Gemini API endpoint (optional fallback)

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Accessible Web Low-Literacy Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        textProcessing: '/api/text',
        user: '/api/user',
        analytics: '/api/analytics',
        settings: '/api/settings',
        gemini: '/api/gemini (optional Gemini API fallback)'
      },
      documentation: 'See README.md for API documentation'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);
}

/**
 * Server Initialization
 */
async function startServer(): Promise<void> {
  try {
    console.log('🚀 Starting Accessible Web Backend...');

    // Initialize database
    console.log('📊 Initializing database...');
    await initializeDatabase();

    // Initialize services
    console.log('🔧 Initializing services...');
    await initializeServices();

    // Configure application
    console.log('⚙️  Configuring application...');
    await configureApp();
    configureRoutes();

    // Create HTTP server
    const server = createServer(app);

    // Start server
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📖 Health Check: http://localhost:${PORT}/api/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Hot reloading enabled');
      }
    });

    // Graceful shutdown handling
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };