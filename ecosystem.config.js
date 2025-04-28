module.exports = {
    apps: [
      {
        name: 'asana-server',
        script: './dist/main.js',
        env: {
          NODE_ENV: 'development',
          PORT: 4000
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 4000
        },
        dotenv: './.env'
      }
    ]
  };
  