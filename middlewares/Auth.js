const NextAuth = require("next-auth").default;
const nextAuthOptions = require("../config/auth.js");

const baseUrl = "/api/auth/";

module.exports = (app) =>
  app.use((req, res, next) => {
    if (!req.url.startsWith(baseUrl)) {
      return next();
    }

    req.query.nextauth = req.url
      .slice(baseUrl.length)
      .replace(/\?.*/, "")
      .split("/");
    NextAuth(req, res, nextAuthOptions);
  });
