#!/bin/bash

# Setup script for Accessible Web Backend
echo "🚀 Setting up Accessible Web Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data
mkdir -p uploads
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server"
else
    echo "✅ Environment file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
else
    echo "❌ npm is not available. Please ensure Node.js is properly installed."
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Run database migrations
echo "📊 Setting up database..."
npm run db:migrate 2>/dev/null || echo "⚠️  Database migration will run on first server start"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Start development server: npm run dev"
echo "   3. Or build for production: npm run build && npm start"
echo ""
echo "📖 API will be available at: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/api/health"
echo ""
echo "📚 See README.md for full documentation"