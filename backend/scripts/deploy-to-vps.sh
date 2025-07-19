#!/bin/bash

# 🦈 School of Sharks - VPS Deployment Script
# Deploy your application to your VPS server

set -e  # Exit on any error

echo "🦈 ================================"
echo "   School of Sharks VPS Deployment"
echo "🦈 ================================"

# Configuration - UPDATE THESE VALUES
VPS_IP="119.59.99.116"
VPS_USER="your_username"  # Update with your VPS username
APP_DIR="/home/$VPS_USER/school-of-sharks"
SERVICE_NAME="school-of-sharks"

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

# Step 1: Build the application
print_step "Building application for production..."
npm run build:production
print_success "Application built successfully"

# Step 2: Create deployment package
print_step "Creating deployment package..."
tar -czf deploy.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    .env.production.vps \
    ecosystem.config.js \
    scripts/

print_success "Deployment package created"

# Step 3: Upload to VPS
print_step "Uploading to VPS server..."
scp deploy.tar.gz $VPS_USER@$VPS_IP:~/
print_success "Files uploaded to VPS"

# Step 4: Deploy on VPS
print_step "Deploying on VPS server..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
    # Create app directory
    mkdir -p ~/school-of-sharks
    cd ~/school-of-sharks
    
    # Extract deployment package
    tar -xzf ~/deploy.tar.gz
    
    # Rename environment file
    mv .env.production.vps .env.production
    
    # Install dependencies (production only)
    npm ci --only=production
    
    # Stop existing service if running
    pm2 stop school-of-sharks || true
    pm2 delete school-of-sharks || true
    
    # Start the application with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
    
    echo "🦈 Deployment completed successfully!"
    echo "📊 Application Status:"
    pm2 status
ENDSSH

# Step 5: Cleanup
print_step "Cleaning up..."
rm deploy.tar.gz
print_success "Cleanup completed"

# Step 6: Health check
print_step "Performing health check..."
sleep 10  # Wait for server to start

if curl -f http://$VPS_IP:5001/health > /dev/null 2>&1; then
    print_success "Health check passed! Application is running"
    echo "🌐 Your application is live at: http://$VPS_IP:5001"
else
    print_warning "Health check failed. Check server logs with: ssh $VPS_USER@$VPS_IP 'pm2 logs school-of-sharks'"
fi

echo ""
echo "🦈 ================================"
echo "   Deployment Complete!"
echo "🦈 ================================"
echo "📊 Monitor with: ssh $VPS_USER@$VPS_IP 'pm2 monit'"
echo "📋 View logs: ssh $VPS_USER@$VPS_IP 'pm2 logs school-of-sharks'"
echo "🔄 Restart: ssh $VPS_USER@$VPS_IP 'pm2 restart school-of-sharks'"
echo "🛑 Stop: ssh $VPS_USER@$VPS_IP 'pm2 stop school-of-sharks'"
