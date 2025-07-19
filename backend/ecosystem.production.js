module.exports = {
  apps: [
    {
      name: 'school-of-sharks-backend-production',
      script: './dist/server.production.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 2, // Run 2 instances for load balancing
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      merge_logs: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '30s',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Advanced production settings
      node_args: '--max-old-space-size=1024',
      
      // Environment file
      env_file: '.env.production',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exit_code: 1,
      
      // Auto-restart settings
      autorestart: true,
      watch_delay: 1000,
      
      // Process management
      vizion: false,
      source_map_support: false,
      
      // Log rotation
      log_type: 'json',
      combine_logs: true
    }
  ],

  // Deployment configuration for VPS
  deploy: {
    production: {
      user: 'goro',
      host: '119.59.99.116',
      ref: 'origin/main',
      repo: 'git@github.com:gorocode2/soswebapp2.git',
      path: '/home/goro/school-of-sharks',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install --production && npm run build:production && pm2 reload ecosystem.production.js --env production',
      'pre-setup': 'mkdir -p /home/goro/school-of-sharks/logs'
    }
  }
};
