#!/bin/bash

echo "🦈 School of Sharks - Emergency Server Deployment"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project
cd ~/soswebapp2

echo -e "${BLUE}📍 Current location: $(pwd)${NC}"

# Stop all running sharks services
echo -e "${YELLOW}🛑 Stopping all sharks services...${NC}"
pm2 stop all
pm2 delete all

# Backup current server
echo -e "${YELLOW}💾 Backing up current server...${NC}"
cp backend/src/server.ts backend/src/server-backup-$(date +%Y%m%d-%H%M%S).ts

# Deploy safe server
echo -e "${YELLOW}🔄 Deploying safe server...${NC}"
cp backend/src/server-safe.ts backend/src/server.ts

# Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
cd backend
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend build successful!${NC}"
else
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi

# Go back to root
cd ..

# Start services with PM2
echo -e "${YELLOW}🚀 Starting School of Sharks services...${NC}"

# Start backend
pm2 start backend/dist/server.js --name "sharks-backend" --env production

# Start frontend (if not running)
pm2 start "cd frontend && npm run dev" --name "sharks-frontend"

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 10

# Check status
echo -e "${BLUE}📊 Service Status:${NC}"
pm2 status

# Test health endpoints
echo -e "${BLUE}🏥 Testing health endpoints...${NC}"

echo -e "${YELLOW}Testing localhost:5000/health...${NC}"
curl -s http://localhost:5000/health | jq -r '.message' 2>/dev/null || echo "Health endpoint not responding"

echo -e "${YELLOW}Testing localhost:5000/api/health...${NC}"
curl -s http://localhost:5000/api/health | jq -r '.message' 2>/dev/null || echo "API health endpoint not responding"

# Test through Nginx
echo -e "${YELLOW}Testing through Nginx (www.soscycling.com)...${NC}"
curl -s http://www.soscycling.com/api/health | jq -r '.message' 2>/dev/null || echo "Nginx proxy not responding"

echo ""
echo -e "${GREEN}🦈 School of Sharks Emergency Deployment Complete!${NC}"
echo -e "${BLUE}📊 Check status: pm2 status${NC}"
echo -e "${BLUE}📋 View logs: pm2 logs sharks-backend${NC}"
echo -e "${BLUE}🔄 Restart: pm2 restart sharks-backend${NC}"
echo ""

# Save PM2 configuration
pm2 save

echo -e "${GREEN}⚡ Ready to dominate the cycling world!${NC}"
