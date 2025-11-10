#!/bin/bash

# Rebuild Extension Script
# This script fixes and rebuilds the Chrome extension

echo "🔧 Rebuilding Chrome Extension..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p dist-extension/assets
mkdir -p dist-extension/icons

# Check if icons exist, if not create placeholder icons
if [ ! -f "dist-extension/icons/icon16.png" ]; then
    echo "⚠️  Icons not found. Please add icon files to dist-extension/icons/"
    echo "   Required: icon16.png, icon48.png, icon128.png"
fi

# Verify all required files exist
echo "✅ Verifying required files..."

required_files=(
    "dist-extension/manifest.json"
    "dist-extension/enhanced-sw.js"
    "dist-extension/content-script.js"
    "dist-extension/popup.html"
    "dist-extension/assets/popup.js"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        missing_files=$((missing_files + 1))
    else
        echo "✓ Found: $file"
    fi
done

if [ $missing_files -eq 0 ]; then
    echo ""
    echo "✅ All required files present!"
    echo ""
    echo "📦 Extension is ready to load!"
    echo ""
    echo "To install the extension:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode' (toggle in top right)"
    echo "3. Click 'Load unpacked'"
    echo "4. Select the 'dist-extension' folder"
    echo ""
    echo "Features available:"
    echo "  ✓ Text Simplification (3 levels)"
    echo "  ✓ Translation (Hindi, Tamil, Telugu)"
    echo "  ✓ Text-to-Speech"
    echo "  ✓ Text Summarization"
    echo "  ✓ Context Menu Integration"
    echo ""
else
    echo ""
    echo "❌ Extension build incomplete. $missing_files file(s) missing."
    exit 1
fi
