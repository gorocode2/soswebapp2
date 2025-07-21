#!/bin/bash

# 🦈 School of Sharks - VPS Deployment Script
echo "🦈 Deploying School of Sharks to VPS..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building Frontend...${NC}"
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend build complete${NC}"

echo -e "${BLUE}📦 Building Backend...${NC}"
cd ../backend
npm run build:production
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend build complete${NC}"

echo -e "${GREEN}🦈 All builds complete! Ready for VPS deployment.${NC}"
echo -e "${BLUE}Next steps for your VPS:${NC}"
echo "1. Pull latest code: git pull origin main"
echo "2. Install dependencies: npm install (in both frontend and backend)"
echo "3. Run builds: npm run build (frontend) and npm run build:production (backend)"
echo "4. Restart backend: pm2 restart backend (or your process manager)"
echo "5. Test: curl http://localhost:5000/api/health"
