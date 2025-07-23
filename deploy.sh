#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Deployment Script for School of Sharks ---

echo "🚀 Starting deployment process..."

# 1. Pull the latest code from the main branch
echo "🔄 Pulling latest code from GitHub..."
git pull origin main
echo "✅ Git pull complete."
echo ""

# 2. Build the Frontend
echo "📦 Building frontend application..."
cd frontend
echo "   - Installing frontend dependencies..."
npm install
echo "   - Running production build..."
npm run build
echo "✅ Frontend build complete."
echo ""

# 3. Build the Backend
echo "📦 Building backend application..."
cd ../backend
echo "   - Installing backend dependencies..."
npm install
echo "   - Running production build..."
npm run build
echo "✅ Backend build complete."
echo ""

# 4. Restart PM2 processes
echo "🔄 Restarting application services with PM2..."
pm2 restart sharks-frontend || pm2 start npm --name "sharks-frontend" -- run start
pm2 restart sharks-backend || pm2 start npm --name "sharks-backend" -- run start
echo "✅ Services restarted."
echo ""

# 5. Show PM2 status
echo "📊 Current status of PM2 processes:"
pm2 list
echo ""

echo "🎉 Deployment finished successfully!"
