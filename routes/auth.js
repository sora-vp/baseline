const express = require("express");
const passport = require("passport");
const { User } = require("../models");

const Router = express.Router();

Router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.json({ errors: err, type: "SERVER_ERROR" });
    if (!user) return res.json(info);

    return res.json({ type: "SUCCESS", user });
  })(req, res, next);
});

Router.post("/register", (req, res) => {
  const { email, nama, pass } = req.body;

  User.findOne({ email }).then((u) => {
    if (u)
      return res.json({ type: "USER_EXIST", message: "Akun telah terdaftar!" });

    const USR = new User({ email, username: nama });

    User.register(USR, pass, (err) => {
      if (err)
        return res.json({
          type: "SERVER_ERROR",
          message: err,
        });

      res.json({
        type: "SUCCESS",
        message: "Akun berhasil ditambahkan.",
      });
    });
  });
});

module.exports = Router;
