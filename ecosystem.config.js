module.exports = {
  apps: [{
    name: 'landycakes-app',
    script: 'npm',
    args: 'start',
    env: {
      PORT: 80,
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}

