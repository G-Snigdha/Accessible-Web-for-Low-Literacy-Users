# 🧠 Chrome Built-in AI Integration Guide

## Overview
Your project has **Chrome Built-in AI (Gemini Nano)** code already written! It's in the TypeScript source files but not being used by the current extension. Here's how to integrate it properly.

---

## ✅ Prerequisites

### 1. Enable Chrome AI Features
You need **Chrome Canary** or **Chrome Dev** (version 127+):

```bash
# Download Chrome Canary
# macOS: https://www.google.com/chrome/canary/
# Windows: https://www.google.com/chrome/canary/
```

### 2. Enable Required Flags
Go to `chrome://flags/` and enable:

1. **`#prompt-api-for-gemini-nano`** → Set to "Enabled"
2. **`#summarization-api-for-gemini-nano`** → Set to "Enabled"
3. **`#rewriter-api-for-gemini-nano`** → Set to "Enabled"
4. **`#writer-api-for-gemini-nano`** → Set to "Enabled"
5. **`#translation-api`** → Set to "Enabled"
6. **`#optimization-guide-on-device-model`** → Set to "Enabled BypassPerfRequirement"

**Restart Chrome after enabling flags**

### 3. Download Gemini Nano Model
Open DevTools Console (F12) and run:

```javascript
await ai.languageModel.create();
```

This will download the Gemini Nano model (~1.7GB). Wait for it to complete.

---

## 🔧 Integration Steps

### Option 1: Quick Test (Use Built Extension)

1. **Build the enhanced extension:**
```bash
cd /Users/gsnigdha/Downloads/DevPost/accessible-web-low-literacy
npm install
npm run build:extension-enhanced
```

2. **Load the extension:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select: `dist-extension-enhanced` folder

3. **Test Chrome AI:**
   - Open any webpage
   - Select text
   - Right-click → "Simplify Text"
   - Check console for AI API calls

---

### Option 2: Integrate AI into Current Extension

Your current extension (`dist-extension/`) uses a simple service worker. Let's add Chrome AI:

#### Step 1: Copy the AI Service File

```bash
# Copy the Chrome AI service to dist-extension
cp extension/src/services/chromeAI.ts dist-extension/chromeAI.js
```

#### Step 2: Update Service Worker

Edit `dist-extension/enhanced-sw.js` or `dist-extension/service-worker.js`:

```javascript
// Add at the top
import { chromeAI } from './chromeAI.js';

// Replace text processing functions with AI calls
async function simplifyText(text) {
  try {
    // Try Chrome AI first
    if (window.ai?.languageModel) {
      const result = await chromeAI.simplify(text);
      if (result.success) {
        return result.data;
      }
    }
    
    // Fallback to backend API
    const response = await fetch('http://localhost:3001/api/text/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, action: 'simplify' })
    });
    
    const data = await response.json();
    return data.data.processed_text;
  } catch (error) {
    console.error('Simplify error:', error);
    return text; // Return original on error
  }
}

async function translateText(text, targetLang = 'es') {
  try {
    // Try Chrome AI Translator
    if (window.ai?.translator) {
      const result = await chromeAI.translate(text, {
        sourceLanguage: 'en',
        targetLanguage: targetLang
      });
      if (result.success) {
        return result.data;
      }
    }
    
    // Fallback to backend
    const response = await fetch('http://localhost:3001/api/text/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, action: 'translate' })
    });
    
    const data = await response.json();
    return data.data.processed_text;
  } catch (error) {
    console.error('Translate error:', error);
    return text;
  }
}

async function proofreadText(text) {
  try {
    // Try Chrome AI Proofreader
    if (window.ai?.languageModel) {
      const result = await chromeAI.proofread(text);
      if (result.success && result.data) {
        return result.data.correctedText;
      }
    }
    
    // Fallback to backend
    const response = await fetch('http://localhost:3001/api/text/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, action: 'proofread' })
    });
    
    const data = await response.json();
    return data.data.processed_text;
  } catch (error) {
    console.error('Proofread error:', error);
    return text;
  }
}

async function summarizeText(text) {
  try {
    // Try Chrome AI Summarizer
    if (window.ai?.summarizer) {
      const result = await chromeAI.summarize(text, {
        type: 'tl;dr',
        length: 'short',
        format: 'plain-text'
      });
      if (result.success) {
        return result.data;
      }
    }
    
    // Fallback: Extract first few sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    return sentences.slice(0, 3).join('. ') + '.';
  } catch (error) {
    console.error('Summarize error:', error);
    return text.substring(0, 200) + '...';
  }
}
```

---

### Option 3: Integrate AI into Website

Update `webapp/enhanced-app.js` to use Chrome AI:

```javascript
// Add Chrome AI detection at the top
const hasChromeAI = typeof window.ai !== 'undefined';

// Modify APIService.processText
class APIService {
    static async processText(text, operation) {
        try {
            // Try Chrome Built-in AI first
            if (hasChromeAI) {
                const aiResult = await this.processWith ChromeAI(text, operation);
                if (aiResult.success) {
                    return {
                        success: true,
                        data: {
                            original_text: text,
                            processed_text: aiResult.data,
                            action: operation,
                            source: 'chrome-ai'
                        }
                    };
                }
            }
            
            // Fallback to backend API
            const response = await fetch(`${CONFIG.apiEndpoint}/api/text/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, action: operation, language: appState.settings.language })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Failed to process text.');
        }
    }
    
    static async processWithChromeAI(text, operation) {
        try {
            switch (operation) {
                case 'simplify':
                    if (window.ai?.rewriter) {
                        const rewriter = await window.ai.rewriter.create({
                            tone: 'more-casual',
                            length: 'shorter'
                        });
                        const result = await rewriter.rewrite(text);
                        rewriter.destroy();
                        return { success: true, data: result };
                    }
                    break;
                    
                case 'translate':
                    if (window.ai?.translator) {
                        const translator = await window.ai.translator.create({
                            sourceLanguage: 'en',
                            targetLanguage: 'es'
                        });
                        const result = await translator.translate(text);
                        translator.destroy();
                        return { success: true, data: result };
                    }
                    break;
                    
                case 'proofread':
                    if (window.ai?.languageModel) {
                        const model = await window.ai.languageModel.create({
                            systemPrompt: 'You are a proofreader. Fix grammar and spelling. Return only the corrected text.'
                        });
                        const result = await model.prompt(text);
                        model.destroy();
                        return { success: true, data: result };
                    }
                    break;
                    
                case 'analyze':
                    if (window.ai?.summarizer) {
                        const summarizer = await window.ai.summarizer.create({
                            type: 'key-points',
                            length: 'short'
                        });
                        const result = await summarizer.summarize(text);
                        summarizer.destroy();
                        return { success: true, data: result };
                    }
                    break;
                    
                case 'rewrite':
                    if (window.ai?.rewriter) {
                        const rewriter = await window.ai.rewriter.create({
                            tone: 'more-formal',
                            length: 'as-is'
                        });
                        const result = await rewriter.rewrite(text);
                        rewriter.destroy();
                        return { success: true, data: result };
                    }
                    break;
            }
            
            return { success: false };
        } catch (error) {
            console.error('Chrome AI error:', error);
            return { success: false };
        }
    }
}
```

---

## 🧪 Testing Chrome AI

### 1. Check AI Availability

Open Chrome DevTools console and run:

```javascript
// Check if AI is available
console.log('AI Available:', typeof window.ai !== 'undefined');

// Check specific APIs
console.log('Language Model:', !!window.ai?.languageModel);
console.log('Summarizer:', !!window.ai?.summarizer);
console.log('Rewriter:', !!window.ai?.rewriter);
console.log('Writer:', !!window.ai?.writer);
console.log('Translator:', !!window.ai?.translator);

// Test capabilities
if (window.ai?.languageModel) {
    const caps = await window.ai.languageModel.capabilities();
    console.log('Capabilities:', caps);
}
```

### 2. Test Simplification

```javascript
// Create a language model
const model = await window.ai.languageModel.create({
    systemPrompt: 'Simplify complex text to grade 5 level.'
});

// Test it
const result = await model.prompt('The utilization of comprehensive methodologies facilitates optimal outcomes.');
console.log('Simplified:', result);

// Clean up
model.destroy();
```

### 3. Test Summarization

```javascript
const summarizer = await window.ai.summarizer.create({
    type: 'tl;dr',
    length: 'short',
    format: 'plain-text'
});

const summary = await summarizer.summarize('Your long text here...');
console.log('Summary:', summary);

summarizer.destroy();
```

---

## 🐛 Troubleshooting

### Issue: `window.ai is undefined`

**Solutions:**
1. Use Chrome Canary/Dev (not stable Chrome)
2. Enable all required flags in `chrome://flags/`
3. Restart Chrome completely
4. Check Chrome version: `chrome://version/` (need 127+)

### Issue: `available: 'no'` in capabilities

**Solutions:**
1. Download the model: `await ai.languageModel.create()`
2. Wait 5-10 minutes for download
3. Check disk space (~2GB needed)
4. Enable `#optimization-guide-on-device-model` with "BypassPerfRequirement"

### Issue: Extension can't access `window.ai`

**Solutions:**
1. Chrome AI is only available in **content scripts** and **web pages**, not service workers
2. Use message passing from content script to service worker
3. Or inject AI code into the webpage context

### Issue: APIs returning errors

**Check:**
```javascript
// Test each API individually
async function testAPIs() {
    const tests = {
        languageModel: async () => {
            if (!window.ai?.languageModel) return 'not-available';
            const caps = await window.ai.languageModel.capabilities();
            return caps.available;
        },
        summarizer: async () => {
            if (!window.ai?.summarizer) return 'not-available';
            const caps = await window.ai.summarizer.capabilities();
            return caps.available;
        },
        rewriter: async () => {
            if (!window.ai?.rewriter) return 'not-available';
            const caps = await window.ai.rewriter.capabilities();
            return caps.available;
        }
    };
    
    for (const [name, test] of Object.entries(tests)) {
        const result = await test();
        console.log(`${name}:`, result);
    }
}

testAPIs();
```

---

## 📊 Which Approach to Use?

| Approach | Use When | Pros | Cons |
|----------|----------|------|------|
| **Backend API** | Testing, demos, always-working features | Works everywhere, predictable | Needs server, not private |
| **Chrome AI** | Production, privacy-focused, offline | 100% private, offline, fast | Chrome-only, setup required |
| **Hybrid (Both)** | **RECOMMENDED** | Best UX, always works | More code complexity |

---

## 🚀 Recommended: Hybrid Approach

Use **Chrome AI when available**, fallback to **backend API**:

1. ✅ Try Chrome Built-in AI first (fast, private, offline)
2. ✅ If unavailable, use backend API (works everywhere)
3. ✅ If backend down, use basic JavaScript fallback

This gives you:
- **Best performance** (Chrome AI is fastest)
- **Best privacy** (data stays local)
- **Best compatibility** (works in all browsers)

---

## 📝 Next Steps

1. **For Extension**: Use the enhanced version in `dist-extension-enhanced/`
2. **For Website**: Add Chrome AI detection and fallback in `webapp/enhanced-app.js`
3. **For Demo**: Show both versions (with/without Chrome AI)
4. **For Submission**: Highlight Chrome AI as primary, backend as fallback

---

## 💡 Demo Script

"Our extension uses **Chrome's Built-in AI (Gemini Nano)** for 100% private, offline text processing. When Chrome AI isn't available, it gracefully falls back to our backend API, ensuring it works everywhere. This hybrid approach gives users the best of both worlds: cutting-edge AI when available, reliable processing always."

---

## 🔗 Resources

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Prompt API Guide](https://developer.chrome.com/docs/ai/built-in-apis)
- [Origin Trial Sign-up](https://developer.chrome.com/origintrials/)
- [Your Implementation]: `extension/src/services/chromeAI.ts`

---

**Need Help?** 
- Check `CHROME_AI_CHALLENGE_SUBMISSION.md` for more details
- See `extension/src/services/chromeAI.ts` for full implementation
- Test with `test-chrome-ai.html` (if exists)
