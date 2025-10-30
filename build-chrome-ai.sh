#!/bin/bash

# Build Chrome Built-in AI Extension for Hackathon
# This script compiles the extension with all AI features

set -e  # Exit on error

echo "🧠 Building Chrome Built-in AI Extension..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
    echo ""
fi

# Clean previous build
echo "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf dist-extension-ai
mkdir -p dist-extension-ai

# Build the extension using Vite
echo "${BLUE}📦 Building extension with Vite...${NC}"
npm run build:extension

# Copy manifest with AI permissions
echo "${BLUE}📋 Copying manifest.json...${NC}"
cp extension/manifest.json dist-extension/manifest.json

# Copy HTML files
echo "${BLUE}📄 Copying HTML files...${NC}"
cp extension/popup.html dist-extension/popup.html
cp extension/options.html dist-extension/options.html

# Create icons directory if it doesn't exist
echo "${BLUE}🎨 Setting up icons...${NC}"
mkdir -p dist-extension/icons

# Create simple icons (if not exist)
if [ ! -f "dist-extension/icons/icon-128.png" ]; then
    echo "${YELLOW}⚠️  Icons not found. Please add icon files to extension/icons/${NC}"
    echo "Creating placeholder text files..."
    echo "Icon 16x16" > dist-extension/icons/icon-16.png
    echo "Icon 32x32" > dist-extension/icons/icon-32.png
    echo "Icon 48x48" > dist-extension/icons/icon-48.png
    echo "Icon 128x128" > dist-extension/icons/icon-128.png
fi

# Copy any existing icons
if [ -d "extension/icons" ]; then
    cp -r extension/icons/* dist-extension/icons/ 2>/dev/null || true
fi

# Verify critical files exist
echo ""
echo "${BLUE}🔍 Verifying build...${NC}"

REQUIRED_FILES=(
    "dist-extension/manifest.json"
    "dist-extension/popup.html"
    "dist-extension/options.html"
)

ALL_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING!"
        ALL_EXIST=false
    fi
done

# Check for compiled JS files
if ls dist-extension/assets/*.js 1> /dev/null 2>&1; then
    JS_COUNT=$(ls -1 dist-extension/assets/*.js | wc -l)
    echo "  ✅ Found $JS_COUNT JavaScript file(s)"
else
    echo "  ❌ No JavaScript files found in dist-extension/assets/"
    ALL_EXIST=false
fi

echo ""

if [ "$ALL_EXIST" = true ]; then
    echo "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "📍 Extension location: ${BLUE}dist-extension/${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Open Chrome Dev/Canary"
    echo "2. Go to chrome://extensions/"
    echo "3. Enable 'Developer mode'"
    echo "4. Click 'Load unpacked'"
    echo "5. Select the 'dist-extension' folder"
    echo ""
    echo "📚 For setup instructions, see: ${BLUE}CHROME_AI_SETUP.md${NC}"
    echo "📖 For full documentation, see: ${BLUE}HACKATHON_SUBMISSION.md${NC}"
else
    echo "${YELLOW}⚠️  Build completed with warnings. Check missing files above.${NC}"
    exit 1
fi
