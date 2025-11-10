#!/bin/bash

# Enhanced Build Script for Accessible Web Chrome Extension
# Builds the enhanced version with all AI features and accessibility tools

set -e  # Exit on any error

echo "🧠 Building Enhanced Accessible Web Extension..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run from the project root directory.${NC}"
    exit 1
fi

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist-extension-enhanced/
mkdir -p dist-extension-enhanced/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build TypeScript files
echo -e "${BLUE}🔨 Compiling TypeScript...${NC}"
npx tsc --project extension/tsconfig.json --outDir dist-extension-enhanced/

# Copy static files
echo -e "${BLUE}📂 Copying static files...${NC}"

# Copy manifest
cp extension/manifest.json dist-extension-enhanced/

# Copy HTML files
cp extension/popup.html dist-extension-enhanced/
cp extension/options.html dist-extension-enhanced/

# Copy icons
mkdir -p dist-extension-enhanced/icons/
cp -r extension/icons/* dist-extension-enhanced/icons/ 2>/dev/null || echo "No icons directory found, creating placeholder..."

# Create placeholder icons if they don't exist
if [ ! -d "extension/icons" ]; then
    echo -e "${YELLOW}⚠️  Creating placeholder icons...${NC}"
    mkdir -p dist-extension-enhanced/icons/
    
    # Create simple SVG icons (can be replaced with proper icons later)
    cat > dist-extension-enhanced/icons/icon-16.png << 'EOF'
<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" fill="#667eea"/>
  <text x="8" y="12" text-anchor="middle" fill="white" font-size="10">AI</text>
</svg>
EOF

    # Convert SVG to different sizes (placeholder approach)
    cp dist-extension-enhanced/icons/icon-16.png dist-extension-enhanced/icons/icon-32.png
    cp dist-extension-enhanced/icons/icon-16.png dist-extension-enhanced/icons/icon-48.png
    cp dist-extension-enhanced/icons/icon-16.png dist-extension-enhanced/icons/icon-128.png
fi

# Build React components with Vite
echo -e "${BLUE}⚛️  Building React components...${NC}"

# Create a temporary vite config for the extension
cat > vite.config.extension-enhanced.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        'popup-ai': resolve(__dirname, 'extension/src/popup-ai.tsx'),
        'options-ui': resolve(__dirname, 'extension/src/options-ui.tsx'),
        'enhanced-content-script': resolve(__dirname, 'extension/src/enhanced-content-script.tsx'),
        'enhanced-background': resolve(__dirname, 'extension/src/enhanced-background.ts'),
        'chromeAI': resolve(__dirname, 'extension/src/services/chromeAI.ts')
      },
      formats: ['es']
    },
    outDir: 'dist-extension-enhanced/src',
    rollupOptions: {
      external: ['chrome'],
      output: {
        globals: {
          chrome: 'chrome'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src-shared')
    }
  }
})
EOF

# Build with Vite
npx vite build --config vite.config.extension-enhanced.ts

# Copy shared styles
echo -e "${BLUE}🎨 Copying styles...${NC}"
mkdir -p dist-extension-enhanced/src/styles/
cp -r src-shared/styles/* dist-extension-enhanced/src/styles/ 2>/dev/null || echo "Creating basic styles..."

# Create basic extension styles if they don't exist
cat > dist-extension-enhanced/src/styles/extension.css << 'EOF'
/* Enhanced Extension Styles */
.extension-popup {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  padding: 0;
  margin: 0;
}

.ai-popup {
  min-width: 400px;
  max-width: 500px;
}

/* Accessibility Enhancements */
.high-contrast {
  background: black !important;
  color: white !important;
}

.large-text {
  font-size: 1.2em;
}

.extra-large-text {
  font-size: 1.4em;
}

/* Animation Classes */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.fade-in {
  animation: fadeIn 0.2s ease-out;
}

/* Focus styles for accessibility */
button:focus,
select:focus,
input:focus,
textarea:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Button styles */
.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.primary-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Sidebar styles */
.sidebar-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-container.left {
  left: 0;
  right: auto;
  box-shadow: 4px 0 20px rgba(0,0,0,0.1);
}

.sidebar-container.dark {
  background: #1f2937;
  color: #f9fafb;
}

/* Notification styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000000;
  max-width: 400px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background: #10b981;
  color: white;
}

.notification.error {
  background: #ef4444;
  color: white;
}

.notification.info {
  background: #3b82f6;
  color: white;
}

.notification.warning {
  background: #f59e0b;
  color: white;
}

/* Floating toolbar styles */
.floating-toolbar {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  padding: 8px;
  z-index: 1000000;
  display: flex;
  gap: 4px;
  animation: fadeIn 0.2s ease-out;
}

.floating-toolbar button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.floating-toolbar button:hover {
  transform: scale(1.05);
}

/* Responsive design */
@media (max-width: 480px) {
  .sidebar-container {
    width: 100vw;
  }
  
  .ai-popup {
    min-width: 300px;
  }
}

/* Dark theme overrides */
.dark-theme {
  background: #1f2937;
  color: #f9fafb;
}

.dark-theme input,
.dark-theme textarea,
.dark-theme select {
  background: #374151;
  color: #f9fafb;
  border: 1px solid #4b5563;
}

.dark-theme .primary-button {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

/* Print styles for accessibility */
@media print {
  .extension-popup,
  .sidebar-container,
  .notification,
  .floating-toolbar {
    display: none !important;
  }
}
EOF

# Update manifest file paths if needed
echo -e "${BLUE}📝 Updating manifest paths...${NC}"

# Create an updated manifest with correct paths
cat > dist-extension-enhanced/manifest.json << 'EOF'
{
  "manifest_version": 3,
  "name": "Accessible Web AI - Enhanced Edition",
  "version": "2.1.0",
  "description": "Advanced accessibility extension powered by Chrome's Built-in AI (Gemini Nano) for text simplification, translation, proofreading, and text-to-speech - all offline and private!",
  "author": "Accessible Web Team",
  
  "permissions": [
    "scripting",
    "activeTab", 
    "storage",
    "tabs",
    "notifications",
    "tts",
    "contextMenus",
    "sidePanel"
  ],
  
  "optional_permissions": [
    "aiLanguageModelOriginTrial"
  ],
  
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  
  "background": {
    "service_worker": "src/enhanced-background.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["src/enhanced-content-script.js"],
      "css": ["src/styles/extension.css"],
      "run_at": "document_end"
    }
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_title": "Accessible Web AI",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  
  "options_page": "options.html",
  
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  
  "web_accessible_resources": [
    {
      "resources": ["src/styles/extension.css", "icons/*"],
      "matches": ["http://*/*", "https://*/*"]
    }
  ],
  
  "commands": {
    "toggle-sidebar": {
      "suggested_key": {
        "default": "Alt+Shift+S",
        "mac": "Alt+Shift+S"
      },
      "description": "Toggle AI assistant sidebar"
    },
    "simplify-page": {
      "suggested_key": {
        "default": "Alt+S",
        "mac": "Alt+S"
      },
      "description": "Simplify selected text"
    },
    "read-aloud": {
      "suggested_key": {
        "default": "Alt+L",
        "mac": "Alt+L"
      },
      "description": "Read selected text aloud"
    }
  }
}
EOF

# Update HTML files to reference correct JS files
echo -e "${BLUE}📄 Updating HTML files...${NC}"

# Update popup.html
cat > dist-extension-enhanced/popup.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessible Web AI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
        }
        #popup-root {
            min-width: 400px;
            max-width: 500px;
        }
    </style>
</head>
<body>
    <div id="popup-root"></div>
    <script src="src/popup-ai.js" type="module"></script>
</body>
</html>
EOF

# Update options.html
cat > dist-extension-enhanced/options.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessible Web AI - Settings</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <div id="options-root"></div>
    <script src="src/options-ui.js" type="module"></script>
</body>
</html>
EOF

# Create README for the built extension
echo -e "${BLUE}📚 Creating documentation...${NC}"
cat > dist-extension-enhanced/README.md << 'EOF'
# 🧠 Accessible Web AI - Enhanced Edition

## Chrome Built-in AI Challenge 2025 Submission

This enhanced Chrome extension leverages Chrome's Built-in AI APIs (Gemini Nano) to make web content more accessible through:

### ✨ Core Features
- **Text Simplification**: Makes complex text easier to understand
- **Proofreading**: Corrects grammar, spelling, and punctuation
- **Translation**: Translates text between multiple languages
- **Text-to-Speech**: Reads content aloud with customizable voices
- **Content Explanation**: Provides simple explanations of complex topics
- **Smart Rewriting**: Improves clarity and tone

### 🔧 Installation Instructions

1. **Enable Chrome Built-in AI APIs**:
   - Use Chrome Dev/Canary (v127+)
   - Enable `chrome://flags/#optimization-guide-on-device-model`
   - Enable `chrome://flags/#prompt-api-for-gemini-nano`
   - Sign up for Early Preview Program

2. **Install Extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this directory

### ⌨️ Keyboard Shortcuts
- `Alt+Shift+S`: Toggle AI sidebar
- `Alt+S`: Simplify selected text
- `Alt+P`: Proofread selected text
- `Alt+T`: Translate selected text
- `Alt+L`: Read selected text aloud
- `Alt+E`: Explain selected text
- `Escape`: Close sidebar/stop speech

### 🎯 Accessibility Features
- High contrast mode
- Adjustable font sizes
- Text-to-speech with voice options
- Keyboard navigation
- Screen reader compatibility
- Customizable interface themes

### 🔒 Privacy & Security
- **100% Local Processing**: All AI operations run on-device
- **No Data Transmission**: Text never leaves your computer
- **Offline Capable**: Works without internet connection
- **Privacy First**: No tracking, analytics, or data collection

### 🏆 Challenge Compliance
This extension showcases all 6 Chrome Built-in AI APIs:
1. **Prompt API** - Custom text processing and explanations
2. **Summarizer API** - Content summarization
3. **Writer API** - Creative and informative writing
4. **Rewriter API** - Text improvement and style changes
5. **Translator API** - Multi-language translation
6. **Proofreader API** - Grammar and spelling correction

### 📊 Target Audience
- Users with low literacy levels
- Non-native language speakers  
- People with reading difficulties
- Anyone seeking clearer web content
- Accessibility-focused users
- Students and learners

### 🚀 Getting Started
1. Install the extension
2. Visit any webpage
3. Select text and use keyboard shortcuts OR
4. Click the extension icon to open the AI assistant
5. Customize settings via the options page

### 💡 Pro Tips
- Use the floating toolbar for quick text processing
- Customize voice settings for optimal text-to-speech
- Enable auto-processing for seamless experience
- Try different simplification levels for your needs

---
Built with ❤️ for the Chrome Built-in AI Challenge 2025
EOF

# Create a simple test HTML file
cat > dist-extension-enhanced/test-page.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page - Accessible Web AI</title>
    <style>
        body {
            font-family: Georgia, serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .complex-text {
            background: #f0f0f0;
            padding: 15px;
            border-left: 4px solid #007acc;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>Test Your Accessible Web AI Extension</h1>
    
    <p>Welcome to the test page for the Accessible Web AI extension. This page contains various types of content to test the extension's capabilities.</p>
    
    <h2>Simple Text</h2>
    <p>This is a simple sentence that should be easy to read and understand.</p>
    
    <h2>Complex Text</h2>
    <div class="complex-text">
        <p>The implementation of artificial intelligence algorithms in contemporary computational frameworks necessitates a comprehensive understanding of the underlying mathematical principles, including but not limited to stochastic gradient descent optimization techniques, backpropagation methodologies, and the intrinsic properties of neural network architectures that facilitate the approximation of complex non-linear functions through hierarchical feature extraction mechanisms.</p>
    </div>
    
    <h2>Text with Errors</h2>
    <p>This sentance has some speling mistakes and grammer errors that the extension should be able to fix. Its a good test to see if the proofreading feature works correctly.</p>
    
    <h2>Technical Content</h2>
    <p>Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.</p>
    
    <h2>Instructions</h2>
    <ol>
        <li>Select any text on this page</li>
        <li>Use keyboard shortcuts like Alt+S (simplify) or Alt+P (proofread)</li>
        <li>Or click the extension icon to open the AI assistant</li>
        <li>Try the text-to-speech feature with Alt+L</li>
        <li>Experiment with different settings in the options page</li>
    </ol>
    
    <p><strong>Tip:</strong> Try selecting the complex text above and using the simplification feature!</p>
</body>
</html>
EOF

# Clean up temporary files
rm -f vite.config.extension-enhanced.ts

# Validate the build
echo -e "${BLUE}✅ Validating build...${NC}"

REQUIRED_FILES=(
    "manifest.json"
    "popup.html"
    "options.html"
    "src/enhanced-background.js"
    "src/enhanced-content-script.js"
    "src/popup-ai.js"
    "src/options-ui.js"
    "src/styles/extension.css"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "dist-extension-enhanced/$file" ]; then
        echo -e "${RED}❌ Missing required file: $file${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    echo -e "${GREEN}✅ All required files present!${NC}"
    
    # Calculate build size
    BUILD_SIZE=$(du -sh dist-extension-enhanced/ | cut -f1)
    echo -e "${GREEN}📦 Build size: $BUILD_SIZE${NC}"
    
    echo -e "${GREEN}"
    echo "=================================================="
    echo "🎉 Enhanced Extension Build Complete!"
    echo "=================================================="
    echo -e "${NC}"
    echo "📁 Output directory: dist-extension-enhanced/"
    echo "🔧 To install:"
    echo "   1. Open Chrome and go to chrome://extensions/"
    echo "   2. Enable 'Developer mode'"
    echo "   3. Click 'Load unpacked' and select dist-extension-enhanced/"
    echo ""
    echo "🧪 To test:"
    echo "   - Open dist-extension-enhanced/test-page.html in Chrome"
    echo "   - Select text and try keyboard shortcuts"
    echo "   - Click the extension icon to open the AI assistant"
    echo ""
    echo -e "${BLUE}🚀 Ready for Chrome Built-in AI Challenge 2025!${NC}"
else
    echo -e "${RED}"
    echo "=================================================="
    echo "❌ Build Failed - Missing Required Files"
    echo "=================================================="
    echo -e "${NC}"
    exit 1
fi