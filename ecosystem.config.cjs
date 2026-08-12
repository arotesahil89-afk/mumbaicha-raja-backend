module.exports = {
  apps: [
    {
      name: "MCR-API",
      script: "server.js",
      cwd: "/home/ec2-user/mumbaicha-raja/api",
      interpreter: "node",

      // ── Zero-Downtime Cluster Mode ─────────────────────────────
      instances: 2,
      exec_mode: "cluster",

      // ── Environment ────────────────────────────────────────────
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },

      // ── Logs ───────────────────────────────────────────────────
      out_file: "/home/ec2-user/mumbaicha-raja/logs/api-out.log",
      error_file: "/home/ec2-user/mumbaicha-raja/logs/api-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // ── Memory & Restart Policy ────────────────────────────────
      watch: false,
      max_memory_restart: "350M",
      restart_delay: 2000,
      max_restarts: 10,

      // ── Graceful Shutdown ──────────────────────────────────────
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
  ],
};
