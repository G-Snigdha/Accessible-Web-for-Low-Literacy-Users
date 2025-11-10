#!/bin/bash

echo "🚀 Starting Accessible Web Low Literacy App - Full Stack"
echo ""

# Start backend server
echo "📡 Starting backend server on port 3001..."
cd backend
node server-simple.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 2

# Start web frontend
echo ""
echo "🌐 Starting web frontend on port 3002..."
cd ..
npm run dev &
WEB_PID=$!
echo "Web PID: $WEB_PID"

# Wait a moment for web to start
sleep 2

# Start mobile app
echo ""
echo "📱 Starting mobile app with Expo..."
cd mobile-app
npx expo start &
MOBILE_PID=$!
echo "Mobile PID: $MOBILE_PID"

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Web App: http://localhost:3002"
echo "📡 Backend API: http://localhost:3001"
echo "📱 Mobile App: Use Expo Go app to scan QR code"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null  
    kill $MOBILE_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait