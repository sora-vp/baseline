const path = require("path");

const root = path.join(__dirname);

const nodeModuleDir = path.join(root, "node_modules");
const appDir = path.join(root, "apps");

const soraDir = path.join(appDir, "sora");

module.exports = {
  apps: [
    {
      name: "sora",
      script: path.join(soraDir, "next/dist/bin/next"),
      cwd: soraDir,
      args: "start -p 3000",
    },
  ],
};
