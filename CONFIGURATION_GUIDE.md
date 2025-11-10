# ⚙️ Configuration Guide - Accessible Text Reader

## 🎯 What You Should Configure Now

Based on your project structure, here are all the configurations you should set up:

---

## 1. 🔐 Environment Variables (Priority: HIGH)

### **Backend Configuration**

Create `.env` file in the `backend/` folder:

```bash
cd /Users/gsnigdha/Downloads/DevPost/accessible-web-low-literacy/backend
cp .env.example .env
```

**Edit `backend/.env` with:**

```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# CORS Settings
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173,http://127.0.0.1:8080

# API Keys (if using external services)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_claude_key_here

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/accessible_text
MONGODB_URI=mongodb://localhost:27017/accessible-text

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-here
ENCRYPTION_KEY=your-32-char-encryption-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/server.log

# External APIs (Optional)
GOOGLE_TRANSLATE_API_KEY=your_key_here
AZURE_TEXT_ANALYTICS_KEY=your_key_here
```

---

### **Frontend Configuration**

Create `.env` file in the `webapp/` folder:

```bash
cd /Users/gsnigdha/Downloads/DevPost/accessible-web-low-literacy/webapp
touch .env
```

**Edit `webapp/.env` with:**

```env
# API Endpoints
VITE_API_URL=http://localhost:3001
VITE_API_ENDPOINT=http://localhost:3001/api

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SPEECH=true
VITE_ENABLE_FILE_UPLOAD=true

# App Configuration
VITE_APP_NAME=Accessible Text Reader
VITE_MAX_TEXT_LENGTH=10000
VITE_DEFAULT_LANGUAGE=en

# Analytics (if using)
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
VITE_POSTHOG_KEY=your_posthog_key

# Sentry Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn_here
```

---

## 2. 📦 Package Configuration

### **Update `backend/package.json`**

Add these scripts and configurations:

```json
{
  "name": "accessible-text-backend",
  "version": "1.0.0",
  "description": "Backend API for Accessible Text Reader",
  "type": "module",
  "main": "server-simple.js",
  "scripts": {
    "start": "node server-simple.js",
    "dev": "nodemon server-simple.js",
    "prod": "NODE_ENV=production node server-simple.js",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0"
  }
}
```

### **Install Additional Backend Dependencies**

```bash
cd backend
npm install dotenv helmet express-rate-limit morgan
npm install --save-dev nodemon eslint prettier
```

---

## 3. 🔒 Security Configuration

### **Add to `backend/server-simple.js`**

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ... rest of your server code
```

---

## 4. 🗄️ Database Configuration (If Needed)

### **Option A: PostgreSQL Setup**

1. **Install PostgreSQL:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

2. **Create Database:**
```bash
createdb accessible_text
```

3. **Update backend/.env:**
```env
DATABASE_URL=postgresql://localhost:5432/accessible_text
```

### **Option B: MongoDB Setup**

1. **Install MongoDB:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

2. **Update backend/.env:**
```env
MONGODB_URI=mongodb://localhost:27017/accessible-text
```

---

## 5. 🎨 Frontend Build Configuration

### **Update `vite.config.ts` (if using Vite)**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': process.env
  }
})
```

---

## 6. 📊 Analytics & Monitoring

### **Google Analytics Setup**

1. **Get GA4 Tracking ID** from https://analytics.google.com

2. **Add to `webapp/enhanced-index.html`:**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### **Sentry Error Tracking**

1. **Install Sentry:**
```bash
npm install @sentry/browser
```

2. **Add to `webapp/enhanced-app.js`:**
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "your_sentry_dsn_here",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

---

## 7. 🚀 Deployment Configuration

### **Vercel Deployment**

Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "webapp/**",
      "use": "@vercel/static"
    },
    {
      "src": "backend/server-simple.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server-simple.js"
    },
    {
      "src": "/(.*)",
      "dest": "webapp/$1"
    }
  ]
}
```

### **Netlify Deployment**

Create `netlify.toml` in root:

```toml
[build]
  command = "npm run build"
  publish = "webapp"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "http://localhost:3001/api/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### **Docker Configuration**

Create `Dockerfile` in root:

```dockerfile
# Backend
FROM node:18-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Frontend
FROM nginx:alpine AS frontend
COPY webapp/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 3001
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./backend:/app/backend
    
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - backend
```

---

## 8. 🧪 Testing Configuration

### **Jest Configuration**

Create `jest.config.js` in backend:

```javascript
export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],
};
```

### **Create Test File**

Create `backend/__tests__/api.test.js`:

```javascript
import request from 'supertest';
import app from '../server-simple.js';

describe('API Tests', () => {
  test('Health check returns 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  test('Text processing works', async () => {
    const response = await request(app)
      .post('/api/text/process')
      .send({
        text: 'Test text',
        action: 'simplify'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 9. 📝 Logging Configuration

Create `backend/logger.js`:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

export default logger;
```

---

## 10. 🔄 CI/CD Configuration

### **GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend && npm ci
        cd ../webapp && npm ci
    
    - name: Run tests
      run: cd backend && npm test
    
    - name: Deploy to production
      run: |
        # Add your deployment commands here
```

---

## 📋 Configuration Checklist

### **Immediate (Do This Now):**
- [ ] Create `backend/.env` file
- [ ] Add CORS origins to .env
- [ ] Install security packages (helmet, rate-limit)
- [ ] Update server-simple.js with security middleware
- [ ] Test all features still work

### **Before Production:**
- [ ] Set up environment variables for production
- [ ] Configure database (if needed)
- [ ] Add error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Add monitoring and logging
- [ ] Configure SSL/HTTPS
- [ ] Set up backups

### **For Deployment:**
- [ ] Choose hosting platform (Vercel, Netlify, AWS, etc.)
- [ ] Create deployment configuration files
- [ ] Set up CI/CD pipeline
- [ ] Configure custom domain
- [ ] Set up CDN (Cloudflare)
- [ ] Add rate limiting
- [ ] Configure CORS for production URLs

### **Optional but Recommended:**
- [ ] Set up Docker containers
- [ ] Add automated testing
- [ ] Configure load balancing
- [ ] Set up staging environment
- [ ] Add API documentation (Swagger)
- [ ] Implement caching (Redis)
- [ ] Add user authentication (if needed)

---

## 🚀 Quick Start Commands

```bash
# 1. Set up environment
cd backend
cp .env.example .env
# Edit .env with your values

# 2. Install security packages
npm install dotenv helmet express-rate-limit morgan winston

# 3. Start servers with new config
cd ..
./start-servers.sh

# 4. Test everything works
curl http://localhost:3001/api/health
curl http://localhost:8080/enhanced-index.html
```

---

## 🔗 Useful Resources

- **Environment Variables:** https://www.npmjs.com/package/dotenv
- **Security Best Practices:** https://expressjs.com/en/advanced/best-practice-security.html
- **Deployment Guides:** https://vercel.com/docs | https://docs.netlify.com
- **Docker Tutorial:** https://docs.docker.com/get-started/

---

**Next Step:** Start with creating the `.env` file and adding security middleware! 🔐
