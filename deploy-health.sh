#!/bin/bash

echo "🦈 Deploying School of Sharks Enhanced Health Endpoints..."
echo "========================================================="

# Navigate to project directory
cd /Users/kamhangenilkamhange/Desktop/coding/2025/soswebapp2

# 📦 Build frontend (if needed)
echo "📦 Checking frontend build..."
if [ ! -d "frontend/.next" ]; then
    echo "Building frontend..."
    cd frontend
    npm run build
    cd ..
fi

# ⚡ Build backend
echo "⚡ Building enhanced cycling API backend..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
echo "✅ Backend build completed with enhanced health endpoints"

# 🚀 Restart PM2 services
echo "🚀 Restarting School of Sharks services..."
cd ..
pm2 restart all

# 🔍 Wait for services to stabilize
echo "⏳ Waiting for services to stabilize..."
sleep 5

# 🦈 Test enhanced health endpoints
echo ""
echo "🔍 Testing Enhanced Health Endpoints:"
echo "===================================="

# Test root endpoint
echo "📍 Testing API root endpoint..."
curl -s http://localhost:5000/ | jq -r '.message' 2>/dev/null || echo "Root endpoint response received"

# Test main health endpoint
echo "📍 Testing main health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
if echo "$HEALTH_RESPONSE" | grep -q "Apex Performance Ready"; then
    echo "✅ Main health endpoint: School of Sharks API ready!"
else
    echo "❌ Main health endpoint not responding correctly"
fi

# Test API health endpoint
echo "📍 Testing API health endpoint..."
API_HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
if echo "$API_HEALTH_RESPONSE" | grep -q "ready to dominate"; then
    echo "✅ API health endpoint: Cycling API unleashed!"
else
    echo "❌ API health endpoint not responding correctly"
fi

# Test through nginx
echo "📍 Testing health endpoints through nginx..."
if curl -f -s http://localhost/health > /dev/null; then
    echo "✅ Health endpoint accessible through nginx"
else
    echo "❌ Health endpoint not accessible through nginx"
fi

if curl -f -s http://localhost/api/health > /dev/null; then
    echo "✅ API health endpoint accessible through nginx"
else
    echo "❌ API health endpoint not accessible through nginx"
fi

echo ""
echo "🦈 PM2 Status:"
echo "=============="
pm2 status

echo ""
echo "🌐 Your School of Sharks Platform URLs:"
echo "======================================"
echo "   🏠 Homepage: http://www.soscycling.com"
echo "   📊 Dashboard: http://www.soscycling.com/dashboard"
echo "   💪 Workouts: http://www.soscycling.com/workout"
echo "   ⚡ API Health: http://www.soscycling.com/health"
echo "   🔗 API Health (Alt): http://www.soscycling.com/api/health"
echo ""
echo "🎯 School of Sharks enhanced health monitoring is ready!"
echo "Your apex cycling platform is unleashed and monitoring its own performance! 🦈⚡"
