const path = require("path");

const root = path.join(__dirname);

const nodeModulesDir = path.join(root, "node_modules");
const appsDir = path.join(root, "apps");

module.exports = {
  apps: [
    {
      name: "sora",
      script: path.join(nodeModulesDir, "next/dist/bin/next"),
      cwd: path.join(appsDir, "sora"),
      args: "start -p 3000",
    },
    {
      name: "vote-processor",
      script: path.join(appsDir, "vote-processor/dist/index.js"),
      cwd: path.join(appsDir, "vote-processor"),
    },
  ],
};
