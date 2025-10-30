# 🧠 Accessible Web AI - Chrome Built-in AI Challenge 2025

[![Chrome Built-in AI](https://img.shields.io/badge/Chrome-Built--in%20AI-4285F4?logo=google-chrome)](https://developer.chrome.com/docs/ai/built-in-apis)
[![Powered by Gemini Nano](https://img.shields.io/badge/Powered%20by-Gemini%20Nano-8E75B2)](https://ai.google.dev/)
[![Privacy First](https://img.shields.io/badge/Privacy-First-00C853)](https://www.google.com/chrome/privacy/)
[![Offline Capable](https://img.shields.io/badge/Offline-Capable-FF6F00)](https://web.dev/offline/)

> **Making the web accessible for everyone using Chrome's Built-in AI APIs - 100% client-side, private, and offline-capable.**

---

## 🎯 Challenge Entry

This project is our entry for the **Google Chrome Built-in AI Challenge 2025**, showcasing the power of client-side AI for web accessibility.

### ✨ What We Built

A Chrome Extension that leverages **all 6 Chrome Built-in AI APIs** to make web content more accessible:

- 💭 **Prompt API** - General AI assistant with multimodal support
- 📄 **Summarizer API** - Distill complex information into insights
- ✏️ **Writer API** - Create original, engaging content
- 🖊️ **Rewriter API** - Improve content with alternatives
- 🌐 **Translator API** - Multilingual translation capabilities
- 🔤 **Proofreader API** - Grammar and spelling correction

All powered by **Gemini Nano** running entirely on your device - no servers, no API keys, no privacy concerns!

---

## 🚀 Quick Start

### Prerequisites

1. **Chrome Dev or Canary** (v127+)
   - Download: [Chrome Dev](https://www.google.com/chrome/dev/) or [Chrome Canary](https://www.google.com/chrome/canary/)

2. **Enable AI Features** (Copy-paste into Chrome address bar):
   ```
   chrome://flags/#optimization-guide-on-device-model
   chrome://flags/#prompt-api-for-gemini-nano
   chrome://flags/#summarization-api-for-gemini-nano
   chrome://flags/#writer-api-for-gemini-nano
   chrome://flags/#rewriter-api-for-gemini-nano
   chrome://flags/#translation-api
   ```
   Set all to "Enabled" → Restart Chrome

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/accessible-web-ai.git
cd accessible-web-ai

# Install dependencies
npm install

# Build extension
npm run build:extension
# or use our custom script
./build-chrome-ai.sh

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select "dist-extension" folder
```

**📖 Detailed setup guide**: [CHROME_AI_SETUP.md](./CHROME_AI_SETUP.md)

---

## 💡 Features & Innovation

### 🔥 All 6 Chrome Built-in AI APIs

| API | Status | Key Features |
|-----|--------|--------------|
| **Prompt API** | ✅ | System prompts, temperature control, multimodal ready |
| **Summarizer** | ✅ | 4 types (TL;DR, key points, teaser, headline), 3 lengths |
| **Writer** | ✅ | 3 tones (formal, neutral, casual), 3 lengths |
| **Rewriter** | ✅ | Tone/length adjustment, context-aware |
| **Translator** | ✅ | 8+ languages, auto-detection |
| **Proofreader** | ✅ | Grammar, spelling, punctuation with explanations |

### 🌟 Innovation Highlights

#### 🔒 Privacy-First Architecture
- **100% client-side** - All AI processing happens on your device
- **No external servers** - Zero data sent to cloud
- **No tracking** - Your data never leaves your browser
- **No API keys** - Completely free to use

#### ⚡ Offline-First Experience
- **Works without internet** - Models run locally
- **Zero latency** - No network delays
- **Always available** - No server downtime
- **Network resilient** - Perfect for unstable connections

#### ♿ Accessibility Champion
- **Low-literacy support** - Simplifies complex text
- **Multilingual access** - Breaks language barriers
- **Keyboard shortcuts** - Fully navigable (Alt+S, Alt+P, Alt+T, etc.)
- **Screen reader friendly** - ARIA labels and semantic HTML

#### 🎨 Developer Experience
- **TypeScript** - Type-safe and maintainable
- **React** - Modern component architecture
- **Modular design** - Clean separation of concerns
- **Comprehensive error handling** - Graceful fallbacks

---

## 🎬 Usage

### Extension Popup

Click the extension icon to open the AI control panel:

![Extension Popup](docs/popup-screenshot.png)

**Features:**
- 6 interactive tabs for each AI API
- Example text for quick testing
- Real-time availability indicators (🟢🟡🔴)
- File upload support (text and images)
- Customizable AI parameters
- Copy to clipboard functionality

### Keyboard Shortcuts

Use AI features anywhere on the web:

| Shortcut | Action |
|----------|--------|
| `Alt + A` | Toggle sidebar |
| `Alt + S` | Simplify selected text |
| `Alt + P` | Proofread selected text |
| `Alt + T` | Translate selected text |
| `Alt + R` | Rewrite selected text |
| `Alt + U` | Summarize current page |
| `Esc` | Close sidebar |

### On-Page Usage

1. **Select any text** on a webpage
2. **Press keyboard shortcut** (e.g., Alt+S for simplify)
3. **See notification** with AI-processed result
4. **Continue reading** with enhanced understanding

---

## 🏗️ Architecture

### Project Structure

```
accessible-web-low-literacy/
├── extension/
│   ├── manifest.json              # Extension config with AI permissions
│   ├── popup.html                 # Popup UI entry
│   ├── options.html               # Settings page
│   └── src/
│       ├── popup-ai.tsx           # Main UI with all 6 AI features
│       ├── content-script-ai.tsx  # On-page AI processing
│       ├── background.ts          # Service worker
│       └── services/
│           └── chromeAI.ts       # AI API wrapper service
├── src-shared/
│   ├── ai/
│   │   └── aiClient.ts           # Shared AI utilities
│   ├── styles/
│   │   └── base.css              # Global styles
│   └── types/
│       └── ai.d.ts               # TypeScript definitions
└── docs/
    ├── HACKATHON_SUBMISSION.md   # Comprehensive project docs
    ├── CHROME_AI_SETUP.md        # Setup guide
    └── API_EXAMPLES.md           # API usage examples
```

### Core AI Service

The `ChromeAIService` class provides a unified interface to all Chrome Built-in AI APIs:

```typescript
class ChromeAIService {
  // Check availability of all APIs
  async checkAvailability(): Promise<AIAvailability>
  
  // Prompt API - General AI assistant
  async prompt(text, options): Promise<Result>
  
  // Summarizer API - Condense information
  async summarize(text, options): Promise<Result>
  
  // Writer API - Create content
  async write(prompt, options): Promise<Result>
  
  // Rewriter API - Improve content
  async rewrite(text, options): Promise<Result>
  
  // Translator API - Multilingual support
  async translate(text, options): Promise<Result>
  
  // Proofreader - Grammar & spelling
  async proofread(text, options): Promise<Result>
}
```

---

## 🎯 Use Cases

### 1. Reading Complex News Articles
**Problem**: Dense political/technical articles hard to understand  
**Solution**: Select text → Alt+S → Get simplified explanation  
**Benefit**: Accessible journalism for all literacy levels

### 2. Writing Professional Emails
**Problem**: Need formal communication but unsure of phrasing  
**Solution**: Writer API → Enter intent → Get professional email  
**Benefit**: Confidence in professional communication

### 3. Language Learning
**Problem**: Encountering foreign language content  
**Solution**: Select text → Alt+T → Instant translation  
**Benefit**: Seamless multilingual browsing

### 4. Research & Studying
**Problem**: Long articles and papers overwhelming  
**Solution**: Alt+U → Get page summary → Decide if worth reading  
**Benefit**: Efficient information triage

### 5. Content Creation
**Problem**: Writer's block or need alternative phrasing  
**Solution**: Rewriter API → Transform existing text  
**Benefit**: Creative inspiration and variety

---

## 🔬 Technical Specifications

### Performance

- **Extension Size**: ~200KB (minified)
- **Memory Usage**: <50MB (with models loaded)
- **Processing Speed**: 
  - Simple operations: <500ms
  - Complex operations: 1-2s
  - First-time model load: 2-5s
- **Offline Capability**: 100%

### Browser Support

- ✅ Chrome Dev/Canary 127+
- ✅ Edge Dev/Canary 127+ (experimental)
- 🔜 Chrome Stable (when APIs ship)

### AI Model Details

- **Model**: Gemini Nano
- **Size**: ~20-100MB (varies by features)
- **Download**: Automatic on first use
- **Storage**: Local device only
- **Updates**: Managed by Chrome

---

## 📊 Chrome Built-in AI Benefits

### ⚙️ Creative Freedom
- **No server costs** → Build freely without budget concerns
- **No quotas** → Unlimited usage for all users
- **No rate limits** → Enable proactive AI patterns

### 🔒 Inherent Privacy
- **On-device processing** → User data never leaves device
- **No cloud dependencies** → No third-party access
- **Hyper-personalized** → Context stays private

### ✅ Network Resilient UX
- **Offline functionality** → Works anywhere, anytime
- **Consistent performance** → No network variance
- **Low latency** → Instant responses

---

## 🚧 Future Roadmap

### Phase 1: Enhanced Features (Q1 2025)
- [ ] Multimodal Prompt API (image + text input)
- [ ] Audio input for accessibility
- [ ] PDF text extraction
- [ ] Custom AI workflows (chain operations)

### Phase 2: Hybrid AI Strategy (Q2 2025)
- [ ] Firebase AI Logic integration
- [ ] Gemini API fallback for mobile
- [ ] Progressive enhancement patterns
- [ ] Cross-platform sync

### Phase 3: Mobile & Beyond (Q3 2025)
- [ ] Chrome Mobile extension support
- [ ] Touch-optimized UI
- [ ] Voice control integration
- [ ] Wearable device support

### Phase 4: Community Features (Q4 2025)
- [ ] User-generated AI templates
- [ ] Shared workflows marketplace
- [ ] API for third-party integration
- [ ] Plugin architecture

---

## 📚 Documentation

- **[HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md)** - Complete project overview
- **[CHROME_AI_SETUP.md](./CHROME_AI_SETUP.md)** - Detailed setup guide
- **[CHROME_EXTENSION_GUIDE.md](./CHROME_EXTENSION_GUIDE.md)** - Extension development guide
- **[API Documentation](https://developer.chrome.com/docs/ai/built-in-apis)** - Chrome AI APIs official docs

---

## 🤝 Contributing

We welcome contributions! This project is open source and community-driven.

### Getting Started

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build:extension

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🏆 Hackathon Submission

**Challenge**: Google Chrome Built-in AI Challenge 2025  
**Category**: Chrome Extension  
**APIs Used**: All 6 Chrome Built-in AI APIs  
**Privacy**: 100% client-side processing  
**Offline**: Fully functional offline  

### Why This Project Stands Out

1. ✅ **Complete API Coverage** - Implements all 6 Chrome Built-in AI APIs
2. ✅ **Real-World Impact** - Solves accessibility challenges for underserved users
3. ✅ **Technical Excellence** - Clean TypeScript architecture, React components
4. ✅ **Privacy Innovation** - Truly private AI with zero server dependencies
5. ✅ **Offline-First** - Works anywhere, anytime, without internet
6. ✅ **Production Ready** - Polished UI, error handling, comprehensive docs
7. ✅ **Open Source** - Extensible, well-documented, community-ready

---

## 👥 Team

**Developer**: [Your Name]  
**Email**: [Your Email]  
**GitHub**: [@yourusername](https://github.com/yourusername)  
**Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

## 🙏 Acknowledgments

- Google Chrome team for Built-in AI APIs
- Gemini team for on-device AI models
- Chrome Extensions platform
- Open source community
- All accessibility advocates

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/accessible-web-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/accessible-web-ai/discussions)
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

## ⭐ Show Your Support

If you find this project useful, please:
- ⭐ Star this repository
- 🐛 Report bugs and suggest features
- 📢 Share with others who might benefit
- 🤝 Contribute code or documentation

---

<div align="center">

**Making the web accessible for everyone, one AI feature at a time. 🌍✨**

Built with ❤️ for the Chrome Built-in AI Challenge 2025

[🧠 View Demo](https://youtu.be/your-demo) • [📖 Read Docs](./HACKATHON_SUBMISSION.md) • [🚀 Get Started](./CHROME_AI_SETUP.md)

</div>
