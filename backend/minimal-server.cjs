const express = require('express');
const cors = require('cors');

console.log('=== Starting Minimal Server ===');

const app = express();
const PORT = 3002;

// Basic middleware
app.use(cors());
app.use(express.json());

// Single test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.send('Hello World');
});

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'ok', message: 'Server is running' });
});

console.log('Creating server...');

try {
  const server = app.listen(PORT, (err) => {
    if (err) {
      console.error('❌ Server error in callback:', err);
      return;
    }
    console.log(`✅ Server successfully listening on port ${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/test`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    
    // Test if server is actually listening
    console.log('Server address info:', server.address());
  });
  
  server.on('error', (err) => {
    console.error('❌ Server error event:', err);
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is in use`);
    }
  });
  
  server.on('listening', () => {
    console.log('🎧 Server listening event fired');
  });
  
} catch (error) {
  console.error('❌ Error creating server:', error);
}

console.log('Script execution complete');