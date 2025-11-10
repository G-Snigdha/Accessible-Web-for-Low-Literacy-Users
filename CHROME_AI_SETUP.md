# 🚀 Chrome Built-in AI Setup Guide

## Quick Start for Hackathon Judges & Testers

This guide will help you get the **Accessible Web AI** Chrome Extension up and running in **under 5 minutes**.

---

## ✅ Prerequisites

### 1. Install Chrome Dev or Canary (Required)

Chrome Built-in AI APIs are only available in Chrome Dev/Canary versions 127+.

**Download Options:**
- **Chrome Dev**: https://www.google.com/chrome/dev/
- **Chrome Canary**: https://www.google.com/chrome/canary/

💡 **Tip**: Chrome Canary gets updates daily and usually has the latest AI features.

### 2. Check Chrome Version

1. Open Chrome Dev/Canary
2. Go to `chrome://version/`
3. Verify version is **127.0** or higher

---

## ⚙️ Enable Chrome AI Features

### Step 1: Enable Required Flags

Copy and paste each URL into Chrome's address bar, select **"Enabled"**, then restart:

```
chrome://flags/#optimization-guide-on-device-model
```
**Set to**: Enabled
**What it does**: Enables on-device AI model

```
chrome://flags/#prompt-api-for-gemini-nano
```
**Set to**: Enabled
**What it does**: Enables Prompt API (Language Model)

```
chrome://flags/#summarization-api-for-gemini-nano
```
**Set to**: Enabled
**What it does**: Enables Summarizer API

```
chrome://flags/#writer-api-for-gemini-nano
```
**Set to**: Enabled (if available)
**What it does**: Enables Writer API

```
chrome://flags/#rewriter-api-for-gemini-nano
```
**Set to**: Enabled (if available)
**What it does**: Enables Rewriter API

```
chrome://flags/#translation-api
```
**Set to**: Enabled (if available)
**What it does**: Enables Translator API

### Step 2: Restart Chrome

After enabling all flags, click **"Relaunch"** button at bottom of page.

### Step 3: Download AI Models (Automatic)

When you first use the extension:
1. Chrome will automatically download Gemini Nano model (~20-100MB)
2. Wait indicator may show "after-download" status
3. Once downloaded, status changes to "readily" (🟢)

💡 **Tip**: Model download happens in background. You can continue using Chrome.

---

## 📦 Install the Extension

### Option 1: Load Unpacked Extension (Development)

1. **Download/Clone Project**
   ```bash
   git clone [repository-url]
   cd accessible-web-low-literacy
   ```

2. **Install Dependencies & Build**
   ```bash
   npm install
   npm run build:extension
   ```
   
   This creates `dist-extension/` folder with compiled extension.

3. **Load in Chrome**
   - Open Chrome Dev/Canary
   - Go to `chrome://extensions/`
   - Enable **"Developer mode"** (top-right toggle)
   - Click **"Load unpacked"**
   - Select the `dist-extension/` folder

4. **Pin Extension** (Optional but Recommended)
   - Click puzzle icon in Chrome toolbar
   - Find "Accessible Web AI"
   - Click pin icon to keep it visible

### Option 2: Pre-built Extension (If Provided)

If a `.zip` or `.crx` file is provided:

1. Download the extension file
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"**
4. Drag and drop the file onto the page

---

## 🧪 Test the Extension

### Quick Functionality Test

1. **Open Extension Popup**
   - Click extension icon in Chrome toolbar
   - You should see 6 tabs: Prompt, Summarize, Write, Rewrite, Translate, Proofread

2. **Check AI Availability**
   - Look for colored dots next to each tab name:
     - 🟢 = Ready to use
     - 🟡 = Downloading model
     - 🔴 = Not available
   - Wait if any show 🟡 (downloading)

3. **Test Prompt API**
   - Click **"Prompt"** tab
   - Click **"📝 Load Example"** button
   - Click **"✨ Prompt with AI"**
   - Should generate creative response in ~1-2 seconds

4. **Test Summarizer API**
   - Click **"Summarize"** tab
   - Click **"📝 Load Example"**
   - Select "Key Points" and "Short"
   - Click **"✨ Summarize with AI"**
   - Should show concise summary

5. **Test Other APIs**
   - Repeat for Writer, Rewriter, Translator, Proofread tabs
   - Each has example text to quickly test

### Test On-Page Features

1. **Visit Any Website**
   - Go to news site, Wikipedia, or blog

2. **Test Keyboard Shortcuts**
   - Select some text
   - Press **Alt + S** (Simplify)
   - Should show notification with simplified text
   
3. **Try Other Shortcuts**
   - **Alt + P** - Proofread selected text
   - **Alt + T** - Translate selected text
   - **Alt + R** - Rewrite selected text
   - **Alt + U** - Summarize entire page

---

## 🔧 Troubleshooting

### Problem: "API not available" error

**Solution:**
1. Check Chrome version (must be 127+)
2. Verify all flags are enabled at `chrome://flags/`
3. Restart Chrome completely
4. Wait for model download (check `chrome://components/` for "Optimization Guide On Device Model")

### Problem: Models not downloading

**Solution:**
1. Go to `chrome://components/`
2. Find "Optimization Guide On Device Model"
3. Click "Check for update"
4. Wait 2-5 minutes
5. Refresh extension

### Problem: Extension not loading

**Solution:**
1. Check build completed successfully (`dist-extension/` exists)
2. Verify manifest.json exists in `dist-extension/`
3. Check Chrome console for errors: `chrome://extensions/` → Details → Errors
4. Try rebuilding: `npm run build:extension`

### Problem: Popup is blank

**Solution:**
1. Right-click extension icon → Inspect popup
2. Check console for errors
3. Verify popup-ai.tsx compiled correctly
4. Reload extension

### Problem: Keyboard shortcuts not working

**Solution:**
1. Check if content script loaded (inspect page → check console)
2. Verify site permissions (some sites block extensions)
3. Try on different website
4. Reload extension

---

## 📊 Verify Installation Success

### Checklist

- [ ] Chrome Dev/Canary 127+ installed
- [ ] All 6 flags enabled and Chrome restarted
- [ ] Extension loaded at `chrome://extensions/`
- [ ] Extension icon visible in toolbar
- [ ] Popup opens and shows 6 tabs
- [ ] At least one API shows 🟢 (ready)
- [ ] Example text loads and processes
- [ ] Keyboard shortcuts work on websites
- [ ] Notifications appear on text processing

If all checked, you're ready to explore! ✅

---

## 🎯 What to Test & Demo

### For Judges - Demo Script (3 minutes)

**1. Show All 6 APIs (1 min)**
- Open extension popup
- Quickly show each tab with example
- Highlight privacy (local processing)

**2. Real-World Usage (1 min)**
- Visit news article
- Select complex paragraph → Alt+S
- Show simplified version
- Alt+P to proofread your own text
- Alt+T to translate

**3. Innovation Points (1 min)**
- Explain offline capability (disconnect WiFi, still works!)
- Show privacy (no network requests)
- Highlight accessibility impact
- Demonstrate keyboard shortcuts

### Feature Highlights to Emphasize

1. **All 6 APIs Implemented** ✅
   - Prompt, Summarizer, Writer, Rewriter, Translator, Proofreader

2. **100% Privacy** 🔒
   - All processing on-device
   - No external API calls
   - No data collection

3. **Fully Offline** ⚡
   - Works without internet
   - Zero latency
   - Consistent performance

4. **Accessibility First** ♿
   - Keyboard navigation
   - Real-world use cases
   - Low-literacy support

5. **Production Quality** 🎨
   - TypeScript + React
   - Error handling
   - Clean UI/UX

---

## 🎬 Video Demo Tips

### Recording Setup

1. **Screen Recording**
   - Use OBS, QuickTime, or Chrome's built-in recorder
   - Resolution: 1920x1080
   - Frame rate: 30fps minimum

2. **Audio**
   - Use microphone for narration
   - Clear, enthusiastic explanation
   - Background music (optional, low volume)

3. **Content Flow**
   - Intro (10s): "Accessible Web AI for Chrome Built-in AI Challenge"
   - Setup (15s): Show extension in Chrome
   - Features (90s): Demo each API
   - Real-world (30s): Use on actual website
   - Closing (15s): Impact statement

### What to Show

✅ Extension popup with all 6 tabs
✅ Each API processing example text
✅ Visual availability indicators (🟢🟡🔴)
✅ Keyboard shortcuts in action
✅ Notification system
✅ Before/after comparisons
✅ Offline functionality (disconnect WiFi)

❌ Don't show build process
❌ Don't show error states (unless recovering)
❌ Don't spend time on settings
❌ Don't go over 3 minutes

---

## 📞 Get Help

### Resources

- **Documentation**: See `HACKATHON_SUBMISSION.md`
- **Chrome AI Docs**: https://developer.chrome.com/docs/ai/built-in-apis
- **Extension Docs**: See `README.md`

### Common Questions

**Q: Do I need API keys?**
A: No! Everything runs locally with Chrome's built-in models.

**Q: Will it work on Stable Chrome?**
A: Not yet. Chrome Dev/Canary only for now.

**Q: Does it send data to servers?**
A: No. 100% on-device processing.

**Q: How big is the model download?**
A: ~20-100MB depending on features used.

**Q: Can I use it offline?**
A: Yes! Once models downloaded, works completely offline.

---

## 🎉 You're Ready!

If you've followed this guide, you should have:
- ✅ Chrome Built-in AI features enabled
- ✅ Extension loaded and working
- ✅ All 6 APIs tested and functional
- ✅ Understanding of key features
- ✅ Ready to demo!

**Now go explore the future of client-side AI! 🚀**

---

## 📝 Quick Reference

### Keyboard Shortcuts
- `Alt + A` - Toggle sidebar
- `Alt + S` - Simplify selection
- `Alt + P` - Proofread selection
- `Alt + T` - Translate selection
- `Alt + R` - Rewrite selection
- `Alt + U` - Summarize page
- `Esc` - Close sidebar

### Chrome URLs
- `chrome://extensions/` - Manage extensions
- `chrome://flags/` - Enable features
- `chrome://version/` - Check version
- `chrome://components/` - Model downloads

### Build Commands
```bash
npm install          # Install dependencies
npm run build:extension   # Build extension
```

---

**Happy Testing! 🎊**
