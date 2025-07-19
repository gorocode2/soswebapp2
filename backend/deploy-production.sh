#!/bin/bash

# 🦈 School of Sharks Production Deployment Script
# Deploys the apex cycling platform to VPS with maximum performance

set -e  # Exit on any error

echo "🦈 ================================"
echo "  School of Sharks Deployment"
echo "🦈 ================================"

# Configuration
VPS_USER="goro"
VPS_HOST="119.59.99.116"
PROJECT_PATH="/home/goro/school-of-sharks"
BACKEND_PATH="$PROJECT_PATH/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}🦈 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Pre-deployment checks
print_step "Running pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in backend directory! Run this script from the backend folder."
    exit 1
fi

# Check if production env file exists
if [ ! -f ".env.production" ]; then
    print_error "Production environment file (.env.production) not found!"
    exit 1
fi

print_success "Pre-deployment checks passed"

# Step 2: Build production bundle
print_step "Building production bundle..."

npm run build:production
if [ $? -eq 0 ]; then
    print_success "Production build completed"
else
    print_error "Production build failed"
    exit 1
fi

# Step 3: Test production build locally (optional)
if [ "$1" = "--test-local" ]; then
    print_step "Testing production build locally..."
    npm run test:production
    print_success "Local production test completed"
fi

# Step 4: Create deployment package
print_step "Creating deployment package..."

DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy necessary files for deployment
cp -r dist/ $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp .env.production $DEPLOY_DIR/
cp ecosystem.production.js $DEPLOY_DIR/

print_success "Deployment package created: $DEPLOY_DIR"

# Step 5: Upload to VPS
print_step "Uploading to VPS server..."

# Create remote directory if it doesn't exist
ssh $VPS_USER@$VPS_HOST "mkdir -p $PROJECT_PATH/backend"

# Upload deployment package
rsync -avz --progress $DEPLOY_DIR/ $VPS_USER@$VPS_HOST:$BACKEND_PATH/

print_success "Files uploaded to VPS"

# Step 6: Deploy on VPS
print_step "Deploying on VPS server..."

ssh $VPS_USER@$VPS_HOST << EOF
    set -e
    cd $BACKEND_PATH
    
    echo "🦈 Installing production dependencies..."
    npm install --only=production
    
    echo "🦈 Creating logs directory..."
    mkdir -p logs
    
    echo "🦈 Stopping existing application..."
    pm2 stop school-of-sharks-backend-production || true
    pm2 delete school-of-sharks-backend-production || true
    
    echo "🦈 Starting production application..."
    pm2 start ecosystem.production.js --env production
    
    echo "🦈 Saving PM2 configuration..."
    pm2 save
    pm2 startup
    
    echo "🦈 Production deployment completed!"
    
    # Wait a moment for the app to start
    sleep 5
    
    echo "🦈 Checking application health..."
    curl -f http://localhost:5000/health || echo "Health check failed - app may still be starting"
    
    echo "🦈 Application status:"
    pm2 status school-of-sharks-backend-production
EOF

print_success "VPS deployment completed"

# Step 7: Clean up local deployment files
print_step "Cleaning up local deployment files..."
rm -rf $DEPLOY_DIR
print_success "Cleanup completed"

# Step 8: Final health check
print_step "Running final health check..."

# Wait a moment for the application to fully start
sleep 10

# Test the production endpoint
if curl -f -s https://soscycling.com/health > /dev/null 2>&1; then
    print_success "🚀 Production health check PASSED!"
    echo "🦈 School of Sharks is now DOMINATING in production!"
    echo "🌐 URL: https://soscycling.com"
    echo "📊 Health: https://soscycling.com/health"
    echo "⚡ API: https://soscycling.com/api"
else
    print_warning "Production health check failed - application may still be starting"
    echo "🔍 Check logs with: ssh $VPS_USER@$VPS_HOST 'pm2 logs school-of-sharks-backend-production'"
fi

echo ""
echo "🦈 ================================"
echo "  DEPLOYMENT COMPLETED!"
echo "🦈 ================================"
echo "🏆 Your apex cycling platform is ready to unleash maximum performance!"
echo ""
echo "📋 Post-deployment commands:"
echo "   • Check status: ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "   • View logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs school-of-sharks-backend-production'"
echo "   • Restart: ssh $VPS_USER@$VPS_HOST 'pm2 restart school-of-sharks-backend-production'"
echo "   • Monitor: ssh $VPS_USER@$VPS_HOST 'pm2 monit'"
echo ""
