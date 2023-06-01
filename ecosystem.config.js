const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const envFile = fs.readFileSync(path.join(__dirname, ".env"));
const actualEnv = dotenv.parse(envFile);

const root = path.join(__dirname);

const nodeModulesDir = path.join(root, "node_modules");
const appsDir = path.join(root, "apps");

module.exports = {
  apps: [
    {
      name: "web",
      script: path.join(appsDir, "web/.next/standalone/apps/web/server.js"),
      cwd: path.join(appsDir, "web"),
      env: {
        NODE_ENV: "production",
        ...actualEnv,
      },
    },
    {
      name: "processor",
      script: path.join(appsDir, "processor/dist/index.js"),
      cwd: path.join(appsDir, "processor"),
      env: {
        NODE_ENV: "production",
        ...actualEnv,
      },
    },
  ],
};
