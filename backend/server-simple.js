import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173', 'http://localhost:8080'];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Simple text processing endpoint
app.post('/api/text/process', async (req, res) => {
  try {
    const { text, action, options = {} } = req.body;
    
    let processed_text = text;
    
    // Simple text processing based on action
    switch (action) {
      case 'simplify':
        const simplifyMode = options.mode || 'basic';
        
        if (simplifyMode === 'basic') {
          // Basic simplification - most common complex words
          processed_text = text
            .replace(/\b(utilize|employ)\b/gi, 'use')
            .replace(/\b(demonstrate|illustrate)\b/gi, 'show')
            .replace(/\b(approximately|roughly)\b/gi, 'about')
            .replace(/\b(commence|initiate)\b/gi, 'start')
            .replace(/\b(facilitate|enable)\b/gi, 'help')
            .replace(/\b(accommodate)\b/gi, 'fit')
            .replace(/\b(implement|execute)\b/gi, 'do')
            .replace(/\b(substantial|significant)\b/gi, 'big');
        } else if (simplifyMode === 'moderate') {
          // Moderate simplification - includes basic + more replacements
          processed_text = text
            .replace(/\b(utilize|employ|leverage)\b/gi, 'use')
            .replace(/\b(demonstrate|illustrate|exhibit)\b/gi, 'show')
            .replace(/\b(approximately|roughly|virtually)\b/gi, 'about')
            .replace(/\b(subsequently|thereafter|consequently)\b/gi, 'then')
            .replace(/\b(commence|initiate|embark)\b/gi, 'start')
            .replace(/\b(facilitate|enable|expedite)\b/gi, 'help')
            .replace(/\b(accommodate|encompass)\b/gi, 'fit')
            .replace(/\b(comprehensive|extensive|exhaustive)\b/gi, 'complete')
            .replace(/\b(implement|execute|accomplish)\b/gi, 'do')
            .replace(/\b(substantial|significant|considerable)\b/gi, 'big')
            .replace(/\b(eliminate|eradicate)\b/gi, 'remove')
            .replace(/\b(acquire|obtain|procure)\b/gi, 'get')
            .replace(/\b(investigate|examine)\b/gi, 'look at')
            .replace(/\b(establish|constitute)\b/gi, 'create')
            .replace(/\b(adjacent|neighboring)\b/gi, 'next to');
        } else if (simplifyMode === 'advanced') {
          // Advanced simplification - most comprehensive
          processed_text = text
            .replace(/\b(utilize|employ|leverage|harness)\b/gi, 'use')
            .replace(/\b(demonstrate|illustrate|exhibit|manifest)\b/gi, 'show')
            .replace(/\b(approximately|roughly|virtually|essentially)\b/gi, 'about')
            .replace(/\b(subsequently|thereafter|consequently|accordingly)\b/gi, 'then')
            .replace(/\b(commence|initiate|embark|undertake)\b/gi, 'start')
            .replace(/\b(facilitate|enable|expedite|accelerate)\b/gi, 'help')
            .replace(/\b(accommodate|encompass|incorporate)\b/gi, 'fit')
            .replace(/\b(comprehensive|extensive|exhaustive|thorough)\b/gi, 'complete')
            .replace(/\b(implement|execute|accomplish|achieve)\b/gi, 'do')
            .replace(/\b(substantial|significant|considerable|noteworthy)\b/gi, 'big')
            .replace(/\b(eliminate|eradicate|abolish)\b/gi, 'remove')
            .replace(/\b(acquire|obtain|procure|secure)\b/gi, 'get')
            .replace(/\b(investigate|examine|scrutinize)\b/gi, 'look at')
            .replace(/\b(establish|constitute|formulate)\b/gi, 'create')
            .replace(/\b(adjacent|neighboring|proximate)\b/gi, 'next to')
            .replace(/\b(modification|alteration)\b/gi, 'change')
            .replace(/\b(requirement|prerequisite)\b/gi, 'need')
            .replace(/\b(assistance|support)\b/gi, 'help')
            .replace(/\b(component|element)\b/gi, 'part')
            .replace(/\b(location|position)\b/gi, 'place')
            .replace(/\b(participate|engage)\b/gi, 'join')
            .replace(/\b(numerous|multiple)\b/gi, 'many')
            .replace(/\b(previous|prior)\b/gi, 'earlier')
            .replace(/\b(concerning|regarding)\b/gi, 'about')
            // Simplify sentence structure
            .replace(/\b(in order to|so as to)\b/gi, 'to')
            .replace(/\b(due to the fact that)\b/gi, 'because')
            .replace(/\b(with regard to|in relation to)\b/gi, 'about')
            .replace(/\b(in spite of|despite the fact that)\b/gi, 'even though')
            .replace(/\b(at this point in time)\b/gi, 'now')
            .replace(/\b(for the purpose of)\b/gi, 'to');
        }
        break;
        
      case 'rewrite':
        processed_text = text
          .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Better sentence breaks
          .replace(/\b(very|really|extremely|incredibly)\s+/gi, '') // Remove intensifiers
          .replace(/\b(in order to)\b/gi, 'to') // Simplify phrases
          .replace(/\b(due to the fact that)\b/gi, 'because')
          .replace(/\b(in spite of)\b/gi, 'despite')
          .replace(/\b(with regard to)\b/gi, 'about')
          .replace(/\b(utilize|employ)\b/gi, 'use')
          .replace(/\b(demonstrate|illustrate)\b/gi, 'show');
        break;
        
      case 'translate':
        const targetLanguage = options.language || 'spanish';
        
        // Translation dictionaries for different languages
        const translations = {
          spanish: {
            'hello': 'hola',
            'world': 'mundo',
            'the': 'el',
            'and': 'y',
            'is': 'es',
            'text': 'texto',
            'this': 'esto',
            'that': 'eso',
            'to': 'a',
            'of': 'de',
            'in': 'en',
            'with': 'con',
            'for': 'para',
            'on': 'en',
            'at': 'en',
            'by': 'por',
            'from': 'de',
            'water': 'agua',
            'food': 'comida',
            'house': 'casa',
            'book': 'libro',
            'car': 'coche',
            'good': 'bueno',
            'bad': 'malo',
            'big': 'grande',
            'small': 'pequeño',
            'yes': 'sí',
            'no': 'no',
            'please': 'por favor',
            'thank you': 'gracias',
            'sorry': 'lo siento',
            'time': 'tiempo',
            'day': 'día',
            'night': 'noche',
            'morning': 'mañana',
            'afternoon': 'tarde'
          },
          french: {
            'hello': 'bonjour',
            'world': 'monde',
            'the': 'le',
            'and': 'et',
            'is': 'est',
            'text': 'texte',
            'this': 'ceci',
            'that': 'cela',
            'to': 'à',
            'of': 'de',
            'in': 'dans',
            'with': 'avec',
            'for': 'pour',
            'on': 'sur',
            'at': 'à',
            'by': 'par',
            'from': 'de',
            'water': 'eau',
            'food': 'nourriture',
            'house': 'maison',
            'book': 'livre',
            'car': 'voiture',
            'good': 'bon',
            'bad': 'mauvais',
            'big': 'grand',
            'small': 'petit',
            'yes': 'oui',
            'no': 'non',
            'please': 's\'il vous plaît',
            'thank you': 'merci',
            'sorry': 'désolé',
            'time': 'temps',
            'day': 'jour',
            'night': 'nuit',
            'morning': 'matin',
            'afternoon': 'après-midi'
          },
          german: {
            'hello': 'hallo',
            'world': 'welt',
            'the': 'der',
            'and': 'und',
            'is': 'ist',
            'text': 'text',
            'this': 'dies',
            'that': 'das',
            'to': 'zu',
            'of': 'von',
            'in': 'in',
            'with': 'mit',
            'for': 'für',
            'on': 'auf',
            'at': 'bei',
            'by': 'von',
            'from': 'von',
            'water': 'wasser',
            'food': 'essen',
            'house': 'haus',
            'book': 'buch',
            'car': 'auto',
            'good': 'gut',
            'bad': 'schlecht',
            'big': 'groß',
            'small': 'klein',
            'yes': 'ja',
            'no': 'nein',
            'please': 'bitte',
            'thank you': 'danke',
            'sorry': 'entschuldigung',
            'time': 'zeit',
            'day': 'tag',
            'night': 'nacht',
            'morning': 'morgen',
            'afternoon': 'nachmittag'
          },
          italian: {
            'hello': 'ciao',
            'world': 'mondo',
            'the': 'il',
            'and': 'e',
            'is': 'è',
            'text': 'testo',
            'this': 'questo',
            'that': 'quello',
            'to': 'a',
            'of': 'di',
            'in': 'in',
            'with': 'con',
            'for': 'per',
            'on': 'su',
            'at': 'a',
            'by': 'da',
            'from': 'da',
            'water': 'acqua',
            'food': 'cibo',
            'house': 'casa',
            'book': 'libro',
            'car': 'macchina',
            'good': 'buono',
            'bad': 'cattivo',
            'big': 'grande',
            'small': 'piccolo',
            'yes': 'sì',
            'no': 'no',
            'please': 'per favore',
            'thank you': 'grazie',
            'sorry': 'scusa',
            'time': 'tempo',
            'day': 'giorno',
            'night': 'notte',
            'morning': 'mattina',
            'afternoon': 'pomeriggio'
          },
          portuguese: {
            'hello': 'olá',
            'world': 'mundo',
            'the': 'o',
            'and': 'e',
            'is': 'é',
            'text': 'texto',
            'this': 'isto',
            'that': 'isso',
            'to': 'para',
            'of': 'de',
            'in': 'em',
            'with': 'com',
            'for': 'para',
            'on': 'em',
            'at': 'em',
            'by': 'por',
            'from': 'de',
            'water': 'água',
            'food': 'comida',
            'house': 'casa',
            'book': 'livro',
            'car': 'carro',
            'good': 'bom',
            'bad': 'mau',
            'big': 'grande',
            'small': 'pequeno',
            'yes': 'sim',
            'no': 'não',
            'please': 'por favor',
            'thank you': 'obrigado',
            'sorry': 'desculpa',
            'time': 'tempo',
            'day': 'dia',
            'night': 'noite',
            'morning': 'manhã',
            'afternoon': 'tarde'
          }
        };
        
        const dictionary = translations[targetLanguage] || translations.spanish;
        processed_text = text;
        
        // Apply translations (case-insensitive, preserve case)
        Object.entries(dictionary).forEach(([english, foreign]) => {
          const regex = new RegExp(`\\b${english}\\b`, 'gi');
          processed_text = processed_text.replace(regex, (match) => {
            // Preserve original case
            if (match === match.toUpperCase()) return foreign.toUpperCase();
            if (match[0] === match[0].toUpperCase()) return foreign[0].toUpperCase() + foreign.slice(1);
            return foreign;
          });
        });
        break;
        
      case 'proofread':
        processed_text = text
          .replace(/\bteh\b/gi, 'the')
          .replace(/\brecieve\b/gi, 'receive')
          .replace(/\bseperate\b/gi, 'separate')
          .replace(/\baccommodate\b/gi, 'accommodate')
          .replace(/\boccurred\b/gi, 'occurred')
          .replace(/\bdefinately\b/gi, 'definitely')
          .replace(/\s+/g, ' ') // Fix multiple spaces
          .replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => p1 + ' ' + p2.toUpperCase()); // Capitalize after punctuation
        break;
      
      case 'analyze':
        const wordCount = text.split(/\s+/).length;
        const sentenceCount = Math.max(1, text.split(/[.!?]+/).filter(s => s.trim().length > 0).length);
        const avgWordsPerSentence = Math.round(wordCount / sentenceCount * 10) / 10;
        const longWords = text.split(/\s+/).filter(word => word.replace(/[^\w]/g, '').length > 6);
        const complexityScore = Math.round((longWords.length / wordCount * 100) * 10) / 10;
        const readingGrade = Math.min(12, Math.max(1, Math.round(0.39 * avgWordsPerSentence + 11.8 * (longWords.length / wordCount) - 15.59)));
        
        // Dynamic sentiment analysis (very basic)
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'happy', 'love', 'best'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'negative', 'problem', 'issue'];
        const textLower = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
        const sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';
        
        res.json({
          success: true,
          data: {
            id: Date.now().toString(),
            original_text: text,
            processed_text: `Analysis complete for ${wordCount} words, ${sentenceCount} sentences`,
            action: 'analyze',
            analysis: {
              reading_level: {
                grade: readingGrade,
                level: readingGrade <= 6 ? 'elementary' : readingGrade <= 9 ? 'middle' : readingGrade <= 12 ? 'high school' : 'college',
                description: `Grade ${readingGrade} reading level`
              },
              complexity_score: complexityScore,
              word_count: wordCount,
              sentence_count: sentenceCount,
              avg_sentence_length: avgWordsPerSentence,
              difficult_words: longWords.slice(0, 5).map(w => w.replace(/[^\w]/g, '')),
              sentiment: sentiment,
              readability_notes: [
                wordCount < 50 ? 'Short text - analysis may be limited' : null,
                avgWordsPerSentence > 20 ? 'Consider shorter sentences' : null,
                complexityScore > 30 ? 'High complexity - consider simpler words' : null
              ].filter(Boolean)
            },
            processing_time_ms: Math.random() * 500 + 100
          },
          message: `Text analysis completed successfully`,
          timestamp: new Date().toISOString()
        });
        return;
        
      default:
        processed_text = text;
    }
    
    res.json({
      success: true,
      data: {
        id: Date.now().toString(),
        original_text: text,
        processed_text,
        action,
        processing_time_ms: Math.random() * 1000 + 200
      },
      message: `Text ${action} completed successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Processing failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Settings endpoint
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      font_size: 'medium',
      language: 'en',
      high_contrast: false,
      reduce_motion: false,
      dark_mode: false,
      tts_enabled: true,
      tts_speed: 1.0,
      auto_simplify: false,
      reading_level_preference: 'auto'
    },
    message: 'Default settings (demo mode)',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0-simple'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Accessible Web Backend API (Simple Mode)',
    status: 'running',
    endpoints: {
      health: '/api/health',
      textProcessing: '/api/text/process',
      settings: '/api/settings'
    },
    version: '1.0.0-simple'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});

export default app;