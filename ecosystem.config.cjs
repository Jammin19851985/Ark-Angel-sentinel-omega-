module.exports = {
  apps: [
    {
      name: "ark-angel-backend",
      script: "server.py",
      interpreter: "python",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "ark-angel-frontend",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "ark-angel-fusion",
      script: "archangel_fusion.py",
      interpreter: "python",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
