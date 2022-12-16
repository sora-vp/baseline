module.exports = {
  apps: [
    {
      name: "sora",
      script: "./apps/sora/node_modules/next/dist/bin/next",
      args: "start -p 3000",
    },
  ],
};
