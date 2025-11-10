#!/bin/bash

# Chrome Extension Setup Script
# Run this to verify your Chrome setup for Built-in AI

echo "🧠 Chrome Built-in AI Extension Setup Guide"
echo "============================================"

echo ""
echo "📋 STEP 1: Check Chrome Version"
echo "You need Chrome Dev or Canary (version 127+)"
echo "Current browser: Check chrome://version/"
echo ""

echo "🔧 STEP 2: Enable AI Flags"
echo "Open these URLs in Chrome and enable the flags:"
echo "1. chrome://flags/#optimization-guide-on-device-model → Enabled"
echo "2. chrome://flags/#prompt-api-for-gemini-nano → Enabled"
echo "3. chrome://flags/#summarization-api-for-gemini-nano → Enabled"
echo "4. chrome://flags/#rewriter-api-for-gemini-nano → Enabled"
echo "5. chrome://flags/#writer-api-for-gemini-nano → Enabled"
echo "6. chrome://flags/#translator-api-for-gemini-nano → Enabled"
echo ""

echo "🔄 STEP 3: Restart Chrome"
echo "After enabling flags, restart Chrome completely"
echo ""

echo "📧 STEP 4: Join Early Preview"
echo "Sign up for Chrome's Built-in AI Early Preview Program:"
echo "https://developer.chrome.com/docs/ai/built-in"
echo ""

echo "✅ STEP 5: Install Extension"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select this folder: $(pwd)/dist-extension-enhanced/"
echo ""

echo "🧪 STEP 6: Test Extension"
echo "1. Visit any webpage"
echo "2. Select some text"
echo "3. Try keyboard shortcuts:"
echo "   - Alt+S = Simplify text"
echo "   - Alt+P = Proofread text"
echo "   - Alt+T = Translate text"
echo "   - Alt+L = Read aloud"
echo "   - Alt+Shift+S = Toggle AI sidebar"
echo ""

echo "🎯 Your extension is located at:"
echo "$(pwd)/dist-extension-enhanced/"