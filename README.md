# 🌟 Accessible Web for Low-Literacy Users

A comprehensive hackathon starter project that combines a **Chrome Extension** and **Progressive Web App (PWA)** to make web content more accessible for users with reading difficulties and low literacy. Features AI-powered text simplification, translation, text-to-speech, and more accessibility tools.

## 🎯 Project Overview

This project provides a complete, production-ready foundation for building accessibility tools that help users with:

- 📖 **Reading difficulties** (dyslexia, visual impairments)
- 🌍 **Language barriers** (ESL learners, multilingual support)
- 🧠 **Cognitive challenges** (processing disorders, learning disabilities)
- 📱 **Limited digital literacy** (simplified interfaces, clear navigation)

## ✨ Key Features

### 🤖 AI-Powered Assistance (Privacy-First)
- **Text Simplification**: Rewrite complex content in simpler language
- **Smart Translation**: Translate content to preferred language
- **Text-to-Speech**: High-quality audio playback with speed control
- **Content Summarization**: Generate easy-to-understand summaries
- **Proofreading**: Grammar and clarity improvements

### ♿ Accessibility Features
- **High Contrast Mode**: Enhanced visual accessibility
- **Large Font Support**: Scalable text sizing (16px-48px)
- **Reading Level Analysis**: Automatic content difficulty assessment
- **Focus Management**: Keyboard navigation support
- **Screen Reader Compatible**: ARIA labels and semantic HTML

### 🛠️ Dual Platform Support
- **Chrome Extension**: Overlay tools on any website
- **PWA Web App**: Standalone reading interface
- **Shared Codebase**: Unified AI client and utilities
- **Offline Capability**: Works without internet connection

### 🔒 Privacy & Security
- **Local Processing**: All AI operations on-device when possible
- **No Data Collection**: Zero personal information stored remotely
- **Offline-First**: Core functionality works without internet
- **Chrome Built-in AI**: Uses browser's native AI APIs when available

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Chrome Browser** (for extension development)
- **Git** (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/accessible-web-low-literacy.git
   cd accessible-web-low-literacy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   # Run both web app and extension in parallel
   npm run dev
   
   # Or run individually:
   npm run dev:web      # PWA on http://localhost:5173
   npm run dev:extension # Extension build with watch mode
   ```

### Chrome Extension Setup

1. **Build the extension**
   ```bash
   npm run build:extension
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked" and select the `extension/` folder
   - The extension icon should appear in your toolbar

3. **Test the extension**
   - Visit any webpage
   - Click the extension icon to open the popup
   - Click "Show Sidebar" to activate the accessibility panel

### PWA Web App

1. **Start the web app**
   ```bash
   npm run dev:web
   ```

2. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Try the Reader tool with sample text or URLs

3. **Install as PWA** (optional)
   - Look for the install prompt in your browser
   - Or use browser menu → "Install Accessible Web..."

## 📁 Project Structure

```
accessible-web-low-literacy/
├── 📂 src-shared/           # Shared code between extension and PWA
│   ├── 📂 ai/              # AI client and Chrome API integration
│   ├── 📂 utils/           # DOM manipulation, storage, helpers
│   ├── 📂 styles/          # Base CSS and accessibility styles
│   └── 📂 types/           # TypeScript type definitions
├── 📂 extension/           # Chrome Extension specific files
│   ├── 📂 src/             # Extension React components
│   ├── 📂 styles/          # Extension-specific CSS
│   ├── manifest.json       # Extension manifest v3
│   ├── popup.html          # Extension popup page
│   └── options.html        # Extension options page
├── 📂 webapp/              # PWA Web Application
│   ├── 📂 src/             # React app components
│   ├── 📂 styles/          # PWA-specific CSS
│   └── 📂 public/          # Static assets, icons
├── 📂 scripts/             # Build and deployment scripts
├── 🔧 vite.config.*.ts     # Build configurations
└── 📚 docs/                # Documentation and guides
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                 # Start both web and extension dev servers
npm run dev:web            # Web app only (http://localhost:5173)
npm run dev:extension      # Extension build with file watching

# Building
npm run build              # Build both web app and extension
npm run build:web          # Build PWA for deployment
npm run build:extension    # Build extension for Chrome store

# Testing & Quality
npm run test               # Run unit tests
npm run lint               # ESLint code analysis
npm run typecheck          # TypeScript type checking
npm run format             # Prettier code formatting

# Preview & Packaging
npm run preview:web        # Preview built web app
npm run preview:pwa        # Serve PWA with production build
npm run package:extension  # Create .zip file for Chrome store
npm run clean              # Remove all build artifacts
```

### Development Workflow

1. **Start development environment**
   ```bash
   npm run dev
   ```

2. **Make your changes**
   - Edit files in `src-shared/`, `extension/src/`, or `webapp/src/`
   - Changes auto-reload in both web app and extension

3. **Test your changes**
   - **Web App**: Check `http://localhost:5173`
   - **Extension**: Reload extension in `chrome://extensions/`

4. **Build for production**
   ```bash
   npm run build
   ```

## 🤖 AI Integration Guide

### Chrome Built-in AI APIs

The project includes stubs and fallbacks for Chrome's experimental AI APIs:

```typescript
// Example: Using the AI client
import { aiClient } from '@/ai/aiClient';

// Simplify text
const result = await aiClient.simplify(complexText, {
  readingLevel: 'elementary',
  language: 'en'
});

// Text-to-speech
await aiClient.readAloud(text, {
  rate: 0.8,
  language: 'en-US'
});

// Translation
const translated = await aiClient.translate(text, {
  from: 'en',
  to: 'es'
});
```

### Adding Custom AI Providers

1. **Extend the AI client** in `src-shared/ai/aiClient.ts`
2. **Add provider-specific logic** with fallbacks
3. **Update type definitions** in `src-shared/types/ai.d.ts`

### Privacy-First Implementation

- All AI processing attempts to stay on-device first
- Fallback to browser APIs (like SpeechSynthesis)
- Network requests only with explicit user consent
- No API keys or external services required for basic functionality

## ♿ Accessibility Features

### Built-in Accessibility

- **WCAG 2.1 AA+ compliance** targeting
- **High contrast themes** with proper color ratios
- **Scalable fonts** from 16px to 48px
- **Keyboard navigation** support throughout
- **Screen reader compatibility** with ARIA labels
- **Reduced motion** support for vestibular disorders

### Text Processing Features

- **Reading level analysis** (Flesch-Kincaid scoring)
- **Content extraction** from complex web pages
- **Text highlighting** and focus management
- **Progressive enhancement** for all users

### Customization Options

Users can adjust:
- Font size and family
- Color contrast levels
- Motion and animation preferences
- Language and localization
- Audio playback speed and voice

## 🏗️ Architecture

### Shared Architecture

Both the Chrome extension and PWA share:
- **AI Client**: Unified interface for all AI operations
- **Utilities**: DOM manipulation, storage, text processing
- **Styles**: Base CSS with accessibility features
- **Types**: TypeScript definitions for consistency

### Chrome Extension Architecture

- **Manifest v3** with service worker background script
- **Content Scripts** for webpage interaction
- **Popup Interface** for quick actions
- **Options Page** for detailed settings
- **Sidebar Overlay** for main accessibility tools

### PWA Architecture

- **React Router** for client-side navigation
- **Service Worker** for offline functionality
- **Responsive Design** for mobile and desktop
- **Progressive Enhancement** for broad browser support

## 📦 Building & Deployment

### Web App Deployment

1. **Build the PWA**
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting service**
   ```bash
   # Example: Deploy to Netlify/Vercel/GitHub Pages
   npx serve webapp/dist -s
   ```

3. **Configure PWA features**
   - Update manifest.json with your details
   - Add your icons to webapp/public/
   - Configure service worker caching

### Chrome Extension Publishing

1. **Build and package**
   ```bash
   npm run package:extension
   ```

2. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload the generated `accessible-web-extension.zip`
   - Fill in store listing details
   - Submit for review

3. **Extension permissions**
   - `activeTab`: Access current webpage content
   - `storage`: Save user preferences
   - `tts`: Text-to-speech functionality
   - `scripting`: Inject accessibility tools

## 🧪 Testing

### Manual Testing Checklist

**Chrome Extension:**
- [ ] Popup opens and displays correctly
- [ ] Sidebar overlay appears on websites
- [ ] Settings persist across sessions
- [ ] Content script injection works
- [ ] AI features respond appropriately

**PWA Web App:**
- [ ] Responsive design on mobile/desktop
- [ ] PWA install prompt appears
- [ ] Offline functionality works
- [ ] Reader tools process text correctly
- [ ] Accessibility features function properly

### Automated Testing

```bash
# Run test suite
npm run test

# Run with UI
npm run test:ui

# Check TypeScript compliance
npm run typecheck
```

## 🤝 Contributing

### Development Setup

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Run quality checks: `npm run lint && npm run typecheck`
5. Submit a pull request

### Contribution Areas

- 🤖 **AI Integration**: Add new AI providers or improve existing ones
- ♿ **Accessibility**: Enhance accessibility features and compliance
- 🌍 **Internationalization**: Add new language support
- 📱 **Mobile Support**: Improve mobile web and responsive design
- 🔧 **DevEx**: Improve developer experience and tooling

### Code Style

- Use **TypeScript** for type safety
- Follow **React best practices** and hooks patterns  
- Write **accessible HTML** with proper ARIA labels
- Include **CSS custom properties** for theming
- Add **JSDoc comments** for complex functions

## 📋 Roadmap

### Phase 1: Core Functionality ✅
- [x] Chrome Extension with popup and options
- [x] PWA with reader interface
- [x] Shared AI client architecture
- [x] Basic accessibility features
- [x] Development and build tooling

### Phase 2: Enhanced AI Features
- [ ] Chrome Built-in AI integration (when available)
- [ ] Advanced text simplification algorithms
- [ ] Multi-language neural translation
- [ ] Voice cloning for personalized TTS
- [ ] Reading comprehension assessment

### Phase 3: Advanced Accessibility
- [ ] Eye tracking integration
- [ ] Voice navigation commands
- [ ] Predictive text assistance  
- [ ] Cognitive load assessment
- [ ] Adaptive UI based on user needs

### Phase 4: Platform Expansion
- [ ] Firefox extension port
- [ ] Safari extension support
- [ ] Desktop application (Electron)
- [ ] Mobile apps (React Native)
- [ ] API for third-party integration

## 🆘 Support & Help

### Common Issues

**Extension not loading:**
- Ensure Chrome Developer mode is enabled
- Check for console errors in extension popup
- Verify manifest.json permissions are correct

**PWA not installing:**
- Confirm HTTPS is enabled (required for PWA)
- Check service worker registration
- Verify manifest.json is valid

**AI features not working:**
- Check browser compatibility for Chrome AI APIs
- Verify fallback implementations are functioning
- Review console for API availability messages

### Getting Help

- 📖 **Documentation**: Check the `/docs` folder
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Bug Reports**: Create detailed issues on GitHub
- 💡 **Feature Requests**: Submit enhancement proposals

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Technologies Used
- **React** - UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tooling
- **Chrome Extensions API** - Browser integration
- **Web Speech API** - Text-to-speech functionality
- **Service Workers** - Offline PWA capabilities

### Accessibility Standards
- **WCAG 2.1** - Web Content Accessibility Guidelines
- **ARIA** - Accessible Rich Internet Applications
- **Section 508** - US Federal accessibility requirements

### Inspiration
Built with ❤️ for users who need accessible web experiences, including:
- People with dyslexia and reading difficulties
- ESL learners and multilingual users  
- Users with cognitive disabilities
- Anyone seeking simplified web content

---

**Made for hackathons, built for accessibility, designed for everyone.**

🚀 Ready to make the web more accessible? [Get started](#quick-start) now!