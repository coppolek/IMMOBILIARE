/**
 * ==============================================================================
 * Affitti Milano - PM2 Ecosystem Configuration for Hostinger VPS
 * 
 * Commands:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 reload ecosystem.config.cjs --env production
 *   pm2 status
 *   pm2 logs affitti-milano
 *   pm2 save
 * ==============================================================================
 */

module.exports = {
  apps: [
    {
      name: 'affitti-milano',
      script: './dist/server.cjs',
      cwd: './',
      instances: 1, // Change to 'max' if you want cluster mode on multi-core VPS
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '600M', // Auto-restart if memory exceeds 600MB
      exp_backoff_restart_delay: 100,
      listen_timeout: 10000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Log management
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
