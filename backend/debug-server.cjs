const express = require('express');
const cors = require('cors');

console.log('=== Debug Server Starting ===');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

const app = express();
const PORT = 3002;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  console.log('✅ Test endpoint hit at:', new Date().toISOString());
  res.send('Hello World - Server is working!');
});

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health endpoint hit at:', new Date().toISOString());
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

console.log('Creating express server...');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server callback executed - server should be listening');
  console.log(`🔗 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  const address = server.address();
  console.log('📍 Server address details:', JSON.stringify(address, null, 2));
  
  // Keep process alive
  setInterval(() => {
    console.log(`💓 Server heartbeat - ${new Date().toISOString()} - uptime: ${process.uptime()}s`);
  }, 10000); // Every 10 seconds
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('listening', () => {
  console.log('🎧 Server "listening" event fired');
});

server.on('connection', (socket) => {
  console.log('🔌 New connection established');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

console.log('🚀 Script execution complete - server should be starting...');