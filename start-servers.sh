#!/bin/bash

# Accessible Web Application - Server Startup Script
# This script starts both the backend API and frontend web server

echo "🚀 Starting Accessible Web Application..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kill any existing servers on ports 3001 and 8080
echo -e "${BLUE}🔍 Checking for existing servers...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 1

# Start Backend API Server
echo -e "\n${BLUE}🔧 Starting Backend API Server (Port 3001)...${NC}"
cd "$SCRIPT_DIR/backend"
nohup node server-simple.js > server.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
sleep 2

# Check backend health
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is healthy!${NC}"
else
    echo -e "${RED}❌ Backend API failed to start${NC}"
    exit 1
fi

# Start Frontend Web Server
echo -e "\n${BLUE}🌐 Starting Frontend Web Server (Port 8080)...${NC}"
cd "$SCRIPT_DIR/webapp"
nohup python3 -m http.server 8080 --bind 127.0.0.1 > /dev/null 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be ready
sleep 2

# Check frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/enhanced-index.html | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is ready!${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    exit 1
fi

# Display success message
echo -e "\n=========================================="
echo -e "${GREEN}🎉 All servers started successfully!${NC}"
echo -e "=========================================="
echo ""
echo -e "${BLUE}📍 Access your application:${NC}"
echo -e "   🌐 Website:  ${GREEN}http://localhost:8080/enhanced-index.html${NC}"
echo -e "   🔧 API:      ${GREEN}http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}📊 Server Status:${NC}"
echo -e "   Backend PID:  $BACKEND_PID"
echo -e "   Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${BLUE}🛑 To stop servers:${NC}"
echo -e "   kill $BACKEND_PID $FRONTEND_PID"
echo -e "   or run: ./stop-servers.sh"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Backend: $SCRIPT_DIR/backend/server.log"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > "$SCRIPT_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$SCRIPT_DIR/.frontend.pid"

echo -e "${GREEN}✨ Ready to use! Open the website link above.${NC}"
echo ""
