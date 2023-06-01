const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const envFile = fs.readFileSync(path.join(__dirname, ".env"));
const actualEnv = dotenv.parse(envFile);

const root = path.join(__dirname);

const nodeModulesDir = path.join(root, "node_modules");
const appsDir = path.join(root, "apps");
const packagesDir = path.join(root, "packages");

module.exports = {
  apps: [
    {
      name: "web",
      script: path.join(nodeModulesDir, "next/dist/bin/next"),
      cwd: path.join(appsDir, "web"),
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        ...actualEnv,
      },
    },
    {
      name: "processor",
      script: path.join(appsDir, "processor/dist/index.js"),
      cwd: path.join(packagesDir, "db"),
      env: {
        NODE_ENV: "production",
        ...actualEnv,
      },
    },
  ],
};
