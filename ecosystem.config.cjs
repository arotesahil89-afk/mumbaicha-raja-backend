module.exports = {
  apps: [
    {
      name: "MCR-API",
      script: "server.js",
      interpreter: "node",

      // ── Instance & Cluster ─────────────────────────────────────
      instances: 1,          // set to "max" to use all CPU cores
      exec_mode: "fork",     // use "cluster" when instances > 1

      // ── Environment ────────────────────────────────────────────
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },

      // ── Logs ───────────────────────────────────────────────────
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // ── Restart behaviour ──────────────────────────────────────
      watch: false,                   // enable in dev if desired
      max_memory_restart: "300M",     // restart if RAM exceeds 300 MB
      restart_delay: 3000,            // wait 3 s before restarting
      max_restarts: 10,               // give up after 10 rapid crashes

      // ── Graceful shutdown ──────────────────────────────────────
      kill_timeout: 5000,             // ms to wait before SIGKILL
      listen_timeout: 8000,           // ms to wait for app "ready"
    },
  ],
};

