const path = require("path");

const root = path.join(__dirname);

const nodeModulesDir = path.join(root, "node_modules");

module.exports = {
  apps: [
    {
      name: "sora",
      script: path.join(nodeModulesDir, "next/dist/bin/next"),
      cwd: path.join(root, "apps/sora"),
      args: "start -p 3000",
    },
  ],
};
