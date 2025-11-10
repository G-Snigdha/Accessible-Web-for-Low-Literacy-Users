#!/bin/bash

# Build script for Chrome Extension packaging
# This script builds the extension and creates a zip file ready for Chrome Web Store

set -e  # Exit on any error

echo "🚀 Starting extension build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf extension/dist
rm -f accessible-web-extension.zip

# Build the extension
echo "🔨 Building extension..."
npm run build:extension

# Check if build was successful
if [ ! -d "extension/dist" ]; then
    echo "❌ Extension build failed - dist directory not found"
    exit 1
fi

# Create package directory structure
echo "📦 Creating package structure..."
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="$TEMP_DIR/accessible-web-extension"

# Copy all necessary files
mkdir -p "$PACKAGE_DIR"
cp -r extension/dist/* "$PACKAGE_DIR/"
cp extension/manifest.json "$PACKAGE_DIR/"
cp extension/popup.html "$PACKAGE_DIR/"
cp extension/options.html "$PACKAGE_DIR/"

# Copy icons if they exist
if [ -d "extension/icons" ]; then
    cp -r extension/icons "$PACKAGE_DIR/"
fi

# Create zip file
echo "🗜️ Creating zip package..."
cd "$TEMP_DIR"
zip -r "accessible-web-extension.zip" "accessible-web-extension"
mv "accessible-web-extension.zip" "$OLDPWD/"

# Cleanup
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h accessible-web-extension.zip | cut -f1)

echo "✅ Extension packaged successfully!"
echo "📁 Package: accessible-web-extension.zip ($FILE_SIZE)"
echo "📋 Next steps:"
echo "   1. Upload to Chrome Web Store Developer Dashboard"
echo "   2. Fill in store listing details"
echo "   3. Submit for review"

# Optional: Validate the package
echo ""
echo "🔍 Package contents:"
unzip -l accessible-web-extension.zip | head -20