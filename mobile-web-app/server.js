const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for text processing (proxy to backend)
app.post('/api/text/process', async (req, res) => {
    try {
        // In a real implementation, this would proxy to the backend
        // For now, we'll simulate the text processing
        const { text, action } = req.body;
        
        let processed_text = '';
        let analysis = null;
        
        switch (action) {
            case 'simplify':
                processed_text = text
                    .replace(/utilize/gi, 'use')
                    .replace(/demonstrate/gi, 'show')
                    .replace(/approximately/gi, 'about')
                    .replace(/multitudinous/gi, 'many')
                    .replace(/technological innovations/gi, 'new technology')
                    .replace(/comprehensive analytical frameworks/gi, 'simple ways to understand')
                    .replace(/optimal utilization/gi, 'best use')
                    .replace(/necessitate/gi, 'need')
                    .replace(/implementation/gi, 'use');
                break;
                
            case 'rewrite':
                processed_text = `Here is a clearer version: ${text.split(' ').slice(0, 10).join(' ')}...`;
                break;
                
            case 'translate':
                processed_text = `[Spanish Translation] Esta es una traducción simulada del texto: ${text.substring(0, 50)}...`;
                break;
                
            case 'proofread':
                processed_text = text
                    .replace(/teh/gi, 'the')
                    .replace(/recieve/gi, 'receive')
                    .replace(/seperate/gi, 'separate')
                    .replace(/definately/gi, 'definitely');
                break;
                
            case 'analyze':
                const words = text.split(' ').length;
                const sentences = text.split(/[.!?]+/).length - 1;
                analysis = {
                    word_count: words,
                    sentence_count: sentences,
                    reading_level: {
                        grade: Math.min(12, Math.max(3, Math.floor(words / sentences) + 2)),
                        level: words > 100 ? 'Advanced' : words > 50 ? 'Intermediate' : 'Basic'
                    },
                    complexity_score: Math.min(10, Math.floor(text.length / 10))
                };
                processed_text = `Text analysis complete. See details below.`;
                break;
                
            default:
                processed_text = text;
        }
        
        res.json({
            success: true,
            data: {
                processed_text,
                analysis
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Processing failed: ' + error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Mobile Web App',
        timestamp: new Date().toISOString()
    });
});

// Serve the main mobile app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`📱 Mobile Web App running on http://localhost:${PORT}`);
    console.log(`🔗 Open in VS Code: Use Simple Browser to navigate to localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});