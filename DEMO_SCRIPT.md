# 🎪 Demo Script: Accessible Web for Low-Literacy Users

A 5-7 minute demo script for hackathon presentations showcasing the Chrome Extension and PWA capabilities.

## 🎯 Demo Overview (7 minutes total)

**Problem Statement** (1 min) → **Chrome Extension Demo** (3 min) → **PWA Demo** (2 min) → **Impact & Next Steps** (1 min)

---

## 📝 Script

### 1. Problem Statement (1 minute)

**"Hi everyone! Imagine you're trying to read a complex news article, but the vocabulary is too advanced, or you're learning English and need help understanding certain phrases. Or maybe you have dyslexia and need text read aloud at the right pace."**

**"For the 36 million adults in the US alone who struggle with basic literacy, and hundreds of millions worldwide, the web can be an overwhelming place. Complex language, poor typography, and lack of accessibility features create barriers to information access."**

**"We built 'Accessible Web' - a comprehensive solution that makes ANY website more accessible through both a Chrome extension and a standalone PWA, powered by privacy-first AI."**

### 2. Chrome Extension Demo (3 minutes)

#### Setup (30 seconds)
**"Let me show you how this works. I'll start with our Chrome extension."**

*Navigate to a complex news article (e.g., The Atlantic, Scientific American)*

**"Here's a typical complex article with academic language and dense paragraphs. For someone with reading difficulties, this would be challenging."**

#### Extension Activation (1 minute)
*Click the extension icon*

**"With one click, our extension popup appears. Notice the clean, accessible design - large text, high contrast, clear icons."**

*Point out popup features:*
- **"Show Sidebar"** - Opens the main accessibility panel
- **"Simplify Page"** - Quick simplification
- **"Language selector"** - For translations
- **"More Settings"** - Detailed customization

*Click "Show Sidebar"*

#### Sidebar Demo (1.5 minutes)
**"This sidebar appears on ANY website and provides comprehensive accessibility tools:"**

*Demo each feature briefly:*

1. **Text Simplification**
   *Click "Simplify Text"*
   **"Watch as complex academic language transforms into clear, simple sentences. This uses AI to rewrite content at an elementary reading level while preserving meaning."**

2. **Text-to-Speech**
   *Click "Read Aloud"*
   **"High-quality text-to-speech with adjustable speed helps users who prefer auditory learning or have visual processing difficulties."**

3. **Translation**
   *Select a different language*
   **"Real-time translation to over 100 languages helps ESL learners and multilingual users."**

4. **Visual Enhancements**
   *Toggle high contrast and font size*
   **"Visual accessibility features include high contrast modes and scalable text from 16px to 48px."**

**"Notice everything works offline-first. No data leaves your browser - it's completely private."**

### 3. PWA Demo (2 minutes)

#### PWA Introduction (30 seconds)
*Switch to web app tab or open new one*

**"Not everyone wants to install browser extensions, so we also built a Progressive Web App with the same features."**

*Navigate to the PWA home page*

**"This web app works on any device - mobile, tablet, desktop - and can be installed like a native app."**

#### Reader Tool Demo (1.5 minutes)
*Navigate to the Reader page*

**"Our Reader tool lets users paste text, upload documents, or enter URLs for processing."**

*Paste a complex text sample or enter a URL*

**"The same AI-powered tools are available:"**

1. **Text Analysis**
   **"It automatically detects reading level using Flesch-Kincaid scoring."**

2. **Multiple Processing Options**
   *Show the tool panel*
   **"Users can simplify, translate, get summaries, or have content read aloud - all in one interface."**

3. **Progressive Enhancement**
   **"The app works even without advanced AI features. It gracefully degrades to use browser APIs and basic text processing."**

*Demonstrate mobile responsiveness by resizing browser*

**"Fully responsive design ensures accessibility across all devices."**

### 4. Impact & Next Steps (1 minute)

#### Technical Highlights (30 seconds)
**"From a technical perspective, we've built:"**

- **"React + TypeScript architecture with shared codebase"**
- **"Chrome Extension Manifest v3 compliance"**
- **"Privacy-first AI with Chrome Built-in AI integration"**
- **"WCAG 2.1 AA+ accessibility compliance"**
- **"Offline-capable PWA with service worker"**

#### Impact & Future (30 seconds)
**"The impact potential is enormous:"**

- **"36M US adults with literacy challenges"**
- **"1.5B English language learners worldwide"**
- **"285M people with visual impairments"**

**"Next steps include integrating Chrome's new built-in AI APIs, expanding language support, and partnering with accessibility organizations for real-world testing."**

**"We've created a production-ready foundation that developers can fork and customize for their specific accessibility needs."**

**"Questions?"**

---

## 🎯 Demo Tips

### Before the Demo

1. **Test everything twice** - Demo gods are real
2. **Pre-load websites** - Use fast, reliable sites
3. **Clear browser cache** - Ensure clean extension state  
4. **Prepare backup content** - Have text ready to paste
5. **Check audio levels** - TTS demo needs good sound

### During the Demo

1. **Speak clearly and pace yourself** - Remember accessibility extends to your presentation
2. **Use large cursor/pointer** - Make it easy to follow
3. **Explain while you click** - Narrate your actions
4. **Show, don't just tell** - Actually use the features
5. **Handle failures gracefully** - Have fallback plans

### Demo Content Suggestions

**Complex Text Samples:**
- Scientific abstracts
- Legal documents
- Academic papers
- News articles with advanced vocabulary
- Medical information

**Websites to Test:**
- Wikipedia (complex articles)
- The Atlantic / The New Yorker
- Government websites (.gov)
- Academic institution pages
- Medical/health information sites

### Technical Setup

```bash
# Ensure everything is built and ready
npm run build:extension
npm run dev:web

# Pre-load extension in Chrome
# Have PWA bookmarked and ready
# Test audio output beforehand
# Clear any console errors
```

### Talking Points for Q&A

**Privacy:** "All AI processing happens on-device when possible. We use Chrome's built-in AI APIs and browser-native features before any network requests."

**Scalability:** "The shared codebase means features developed for one platform automatically work on both. Easy to maintain and expand."

**Accessibility:** "We follow WCAG 2.1 AA+ guidelines and test with actual screen readers and accessibility tools."

**Business Model:** "Open source foundation with potential for premium features, enterprise licensing, or partnerships with accessibility organizations."

**Technical Challenges:** "Chrome Built-in AI is still experimental, so we built robust fallbacks. The hardest part was making complex AI features work reliably across different environments."

---

## 🏆 Success Metrics for Hackathon

- **Technical Innovation:** Chrome Built-in AI integration, dual-platform architecture
- **User Impact:** Clear accessibility improvements, real-world applicability  
- **Code Quality:** Production-ready, well-documented, extensible
- **Presentation:** Clear demo, strong problem-solution fit
- **Potential:** Scalable solution with broad market appeal

**Good luck with your hackathon! 🚀**