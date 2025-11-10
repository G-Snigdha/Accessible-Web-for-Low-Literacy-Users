const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Backend server is running'
  });
});

// Text processing endpoint
app.post('/api/text/process', (req, res) => {
  console.log('Text processing requested:', req.body);
  
  try {
    const { text, action } = req.body;
    
    if (!text || !action) {
      return res.status(400).json({
        success: false,
        error: 'Text and action are required'
      });
    }
    
    let processed_text = text;
    
    // Simple text processing
    switch (action) {
      case 'simplify':
        processed_text = text
          .replace(/\b(utilize|employ)\b/gi, 'use')
          .replace(/\b(demonstrate|illustrate)\b/gi, 'show')
          .replace(/\b(approximately|roughly)\b/gi, 'about')
          .replace(/\b(subsequently|thereafter)\b/gi, 'then')
          .replace(/\b(commence|initiate)\b/gi, 'start');
        break;
        
      case 'rewrite':
        processed_text = text
          .replace(/\b(very|really|extremely)\s+/gi, '')
          .replace(/\b(in order to)\b/gi, 'to')
          .replace(/\b(due to the fact that)\b/gi, 'because');
        break;
        
      case 'proofread':
        processed_text = text
          .replace(/\bteh\b/gi, 'the')
          .replace(/\brecieve\b/gi, 'receive')
          .replace(/\bseperate\b/gi, 'separate')
          .replace(/\s+/g, ' ')
          .trim();
        break;
        
      case 'translate':
        processed_text = text
          .replace(/\bhello\b/gi, 'hola')
          .replace(/\bworld\b/gi, 'mundo')
          .replace(/\bthe\b/gi, 'el')
          .replace(/\bgood\b/gi, 'bueno')
          .replace(/\bmorning\b/gi, 'mañana');
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Supported actions: simplify, rewrite, proofread, translate'
        });
    }
    
    res.json({
      success: true,
      data: {
        processed_text: processed_text,
        original_text: text,
        action: action
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start server - THE KEY FIX: specify '0.0.0.0' as host
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Text processing: http://localhost:${PORT}/api/text/process`);
  console.log(`📍 Server bound to:`, server.address());
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Try another port.`);
  }
});

console.log('Starting backend server...');