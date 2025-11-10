#!/bin/bash

# Accessible Web Application - Server Stop Script
# This script stops both the backend API and frontend web server

echo "🛑 Stopping Accessible Web Application..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Stop by PID files if they exist
if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend stopped (PID: $BACKEND_PID)${NC}"
    fi
    rm "$SCRIPT_DIR/.backend.pid"
fi

if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$SCRIPT_DIR/.frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    fi
    rm "$SCRIPT_DIR/.frontend.pid"
fi

# Also kill any processes on ports 3001 and 8080 (backup)
echo -e "\n${BLUE}🔍 Cleaning up ports 3001 and 8080...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Port 3001 freed${NC}" || echo -e "Port 3001 already free"
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Port 8080 freed${NC}" || echo -e "Port 8080 already free"

echo ""
echo -e "${GREEN}✅ All servers stopped successfully!${NC}"
echo ""
