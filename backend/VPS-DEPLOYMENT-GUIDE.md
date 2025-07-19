# 🦈 School of Sharks - VPS Deployment Guide

## Overview
Your local development environment is successfully connected to your VPS PostgreSQL database! Now you need to set up the production environment on your VPS server.

## What You Need to Do on Your VPS

### 1. Environment Configuration
Upload the `.env.production.vps` file to your VPS and rename it to `.env.production`:

```bash
# On your VPS server
cd /path/to/your/app
cp .env.production.vps .env.production
```

### 2. Update the VPS Environment File
Edit `.env.production` on your VPS and update these critical values:

```bash
# Update with your actual secure passwords
DB_PASSWORD=your_actual_database_password_here
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
SESSION_SECRET=your_super_secure_session_secret_minimum_32_characters

# Update with your actual domain (when you have one)
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

### 3. Key Differences Between Local and VPS Production:

| Setting | Local Production (dev) | VPS Production |
|---------|----------------------|----------------|
| DB_HOST | `119.59.99.116` (external) | `localhost` (internal) |
| PORT | `5001` | `5001` |
| SSL | `false` | `true` (when domain ready) |
| CORS_ORIGIN | `http://localhost:3000` | `https://yourdomain.com` |

### 4. VPS Setup Checklist

#### A. Install Dependencies on VPS
```bash
# Install Node.js, npm, and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

#### B. PostgreSQL Setup (if not done)
```bash
# PostgreSQL should already be running with user 'goro'
# Verify connection:
sudo -u postgres psql -c "SELECT version();"
```

#### C. Deploy Your Application
Use the deployment script or manual deployment:

**Option 1: Automated Deployment**
```bash
# Update VPS_USER in scripts/deploy-to-vps.sh first
./scripts/deploy-to-vps.sh
```

**Option 2: Manual Deployment**
```bash
# 1. Build locally
npm run build:production

# 2. Upload files to VPS
scp -r dist/ package.json .env.production.vps ecosystem.config.js your_user@119.59.99.116:~/school-of-sharks/

# 3. On VPS, install and start
ssh your_user@119.59.99.116
cd school-of-sharks
mv .env.production.vps .env.production
npm ci --only=production
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Security Considerations for VPS

#### A. Database Security
- ✅ PostgreSQL is accessible only from localhost (secure)
- ✅ Use strong passwords for database user 'goro'
- ✅ Regular backups recommended

#### B. Application Security
- ✅ Helmet.js for security headers
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Environment variables for secrets

#### C. Server Security
- 🔒 Consider setting up SSL/TLS certificates (Let's Encrypt)
- 🔒 Configure firewall (ufw) to only allow necessary ports
- 🔒 Regular system updates

### 6. Monitoring & Maintenance

```bash
# Check application status
pm2 status

# View logs
pm2 logs school-of-sharks

# Monitor resources
pm2 monit

# Restart application
pm2 restart school-of-sharks

# Health check
curl http://119.59.99.116:5001/health
```

### 7. Domain Setup (Future)
When you get a domain:
1. Update DNS A record to point to `119.59.99.116`
2. Set up SSL certificate (Let's Encrypt)
3. Update environment variables with your domain
4. Configure reverse proxy (nginx) if needed

## Current Status ✅
- ✅ Local development connected to VPS database
- ✅ Production environment files created
- ✅ Deployment scripts ready
- ⏳ Need to deploy to VPS and update environment variables

## Next Steps
1. Update `.env.production.vps` with your secure passwords
2. Deploy to your VPS using the deployment script
3. Test the production deployment
4. Set up monitoring and backups
