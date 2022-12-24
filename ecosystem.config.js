const path = require("path");

const root = path.join(__dirname);

const nodeModuleDir = path.join(root, "node_modules");
const appDir = path.join(root, "apps");

module.exports = {
  apps: [
    {
      name: "sora",
      script: path.join(nodeModuleDir, "next/dist/bin/next"),
      cwd: path.join(appDir, "sora"), 
      args: "start -p 3000",
    },
  ],
};
