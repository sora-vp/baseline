const path = require("path");

const root = path.join(__dirname);

const nodeModulesDir = path.join(root, "node_modules");
const appsDir = path.join(root, "apps");

module.exports = {
  apps: [
    {
      name: "sora",
      script: path.join(appsDir, "sora/node_modules/next/dist/bin/next"),
      env: {
        NODE_PATH:
          nodeModulesDir + ":" + path.join(appsDir, "/sora/node_modules"),
      },
      cwd: path.join(root, "apps/sora"),
      args: "start -p 3000",
    },
  ],
};
