# 🔧 Chrome Extension Setup Guide

## 📦 **Loading Your Extension in Chrome**

### **Step 1: Prepare Extension Files**

Your extension is already built in the `dist-extension` folder!

```bash
cd /Users/gsnigdha/Downloads/DevPost/accessible-web-low-literacy/dist-extension
ls -la
```

You should see:
- `manifest.json`
- `popup.html`
- `options.html`
- `assets/` folder

---

### **Step 2: Load Extension in Chrome**

1. **Open Chrome**
2. **Go to Extensions Page**
   - Type in address bar: `chrome://extensions/`
   - Or Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the switch in top-right corner

4. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to: `/Users/gsnigdha/Downloads/DevPost/accessible-web-low-literacy/dist-extension`
   - Click "Select" or "Open"

5. **Done!** ✅
   - Extension icon should appear in toolbar
   - Click it to use

---

### **Step 3: Test Your Extension**

1. Click the extension icon in Chrome toolbar
2. Should open popup with your accessible text features
3. Try processing some text

---

## 🚀 **Publishing to Chrome Web Store (Optional)**

If you want to publish publicly:

### **What You Need:**

1. **Google Developer Account** ($5 one-time fee)
   - Go to: https://chrome.google.com/webstore/devconsole
   - Sign in with Google account
   - Pay $5 registration fee

2. **Extension Package**
   - Zip your `dist-extension` folder
   ```bash
   cd /Users/gsnigdha/Downloads/DevPost/accessible-web-low-literacy
   zip -r extension.zip dist-extension/
   ```

3. **Store Listing Info**
   - Extension name
   - Description
   - Screenshots (1280x800 or 640x400)
   - Icon (128x128)
   - Promotional images

---

## 🔑 **API Keys You MIGHT Actually Need:**

### **1. Google Cloud Text-to-Speech API** (Optional Enhancement)
If you want better TTS than browser's built-in:

```
Get from: https://console.cloud.google.com/
Service: Cloud Text-to-Speech API
Free tier: 1M chars/month
```

### **2. OpenAI API** (Optional Enhancement)
If you want AI-powered text processing:

```
Get from: https://platform.openai.com/api-keys
Free trial: $5 credit
```

### **3. Google Translate API** (Optional Enhancement)
If you want better translation:

```
Get from: https://console.cloud.google.com/
Service: Cloud Translation API
Free tier: 500K chars/month
```

### **4. Microsoft Azure Cognitive Services** (Optional)
For advanced text analysis:

```
Get from: https://portal.azure.com/
Service: Text Analytics
Free tier: 5K transactions/month
```

---

## 📝 **Current Setup (NO API KEYS NEEDED!)**

Your application currently works **without any API keys** because:

✅ **Text-to-Speech** - Uses browser's Web Speech API (free, built-in)
✅ **Text Processing** - Uses your own backend server (no external APIs)
✅ **All Features** - Self-contained, no third-party services

---

## 🎯 **Quick Decision Guide:**

### **Just Want to Use Locally?**
→ **NO API KEYS NEEDED** - Everything works!

### **Want to Test Chrome Extension?**
→ **NO API KEYS NEEDED** - Just load unpacked extension

### **Want to Publish Extension?**
→ **Only need:** Google Developer Account ($5)

### **Want AI-Powered Features?**
→ **Optional:** OpenAI API key for better text processing

### **Want Professional TTS?**
→ **Optional:** Google Cloud TTS API key

---

## 🔧 **How to Add API Keys (If Needed Later):**

### **Create .env file:**

```bash
cd /Users/gsnigdha/Downloads/DevPost/accessible-web-low-literacy/backend
nano .env
```

### **Add your keys:**

```env
# Optional: OpenAI for AI-powered text processing
OPENAI_API_KEY=sk-your-key-here

# Optional: Google Cloud for better TTS
GOOGLE_CLOUD_API_KEY=your-key-here

# Optional: Google Translate API
GOOGLE_TRANSLATE_API_KEY=your-key-here

# Port configuration
PORT=3001
NODE_ENV=development
```

### **Install dotenv:**

```bash
npm install dotenv
```

### **Update server.js:**

```javascript
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
```

---

## ✅ **Recommended Next Steps:**

### **For Development (Now):**
1. ✅ Keep using current setup (no API keys needed)
2. ✅ Load extension in Chrome for testing
3. ✅ Test all features locally

### **For Production (Later):**
1. Consider adding OpenAI API for better text processing
2. Consider Google Cloud TTS for better voices
3. Set up proper environment variables
4. Deploy backend to cloud service

---

## 🎨 **Chrome Extension Screenshots Needed for Store:**

If you decide to publish:

```bash
# Create screenshots folder
mkdir -p screenshots

# Take screenshots at these sizes:
1280 x 800 (main screenshots)
640 x 400 (promotional tile)
440 x 280 (small promotional tile)
```

**What to screenshot:**
1. Extension popup with features
2. Text processing in action
3. Results display
4. Settings panel
5. Before/after comparison

---

## 📱 **Extension Store Listing Template:**

```
Name: Accessible Text Reader
Category: Productivity
Short Description: Simplify complex text, improve readability, and enhance accessibility

Full Description:
Transform complex text into easy-to-read content with our accessibility-focused extension.

Features:
✨ Text Simplification - Replace complex words with simple alternatives
🔄 Text Rewriting - Improve sentence structure and clarity
📊 Text Analysis - Get reading level and complexity scores
🔊 Text-to-Speech - Listen to any text
✏️ Proofreading - Fix spelling and grammar errors
🌍 Translation - Basic multi-language support

Perfect for:
- Students learning to read
- People with reading disabilities
- Non-native English speakers
- Anyone who wants clearer content

Privacy: All processing done locally, no data collected
```

---

## 🔗 **Useful Links:**

- **Chrome Web Store Developer Dashboard:** https://chrome.google.com/webstore/devconsole
- **Extension Development Guide:** https://developer.chrome.com/docs/extensions/
- **Google Cloud Console:** https://console.cloud.google.com/
- **OpenAI Platform:** https://platform.openai.com/

---

## ❓ **Common Questions:**

**Q: Do I need to pay for anything?**
A: No! Everything works for free locally. Only need $5 if you want to publish to Chrome Web Store.

**Q: Can I use the extension now?**
A: Yes! Just load it as "unpacked extension" in Chrome - no API keys needed.

**Q: Is my data sent anywhere?**
A: No! Everything processes on your local server (localhost:3001). No external services.

**Q: How do I update the extension?**
A: Rebuild it, then click reload button in chrome://extensions/

---

**You don't need any API keys right now! Your app works perfectly as-is.** 🎉
