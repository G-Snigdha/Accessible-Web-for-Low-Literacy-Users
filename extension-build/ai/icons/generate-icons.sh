#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Please install it using: brew install imagemagick"
    exit 1
fi

# Directory containing the icons
ICON_DIR="$(dirname "$0")"

# Convert SVG to different PNG sizes
convert -background none -resize 16x16 "$ICON_DIR/icon.svg" "$ICON_DIR/icon16.png"
convert -background none -resize 48x48 "$ICON_DIR/icon.svg" "$ICON_DIR/icon48.png"
convert -background none -resize 128x128 "$ICON_DIR/icon.svg" "$ICON_DIR/icon128.png"

echo "Icons generated successfully!"