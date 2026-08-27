module.exports = {
  apps: [
    {
      name: "keyling",
      script: "dist/server.cjs",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        PORT: 6644,
      },
    },
  ],
};
