const express = require("express");
const passport = require("passport");
const { User } = require("../models");

const Router = express.Router();

Router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.json({ errors: err, type: "SERVER_ERROR" });
    if (!user) return res.json({ ...info, type: "USER_NOT_FOUND" });

    return res.json({ type: "SUCCESS", user });
  })(req, res, next);
});

Router.post("/register", (req, res) => {
  const USR = new User({ email: req.body.email, username: req.body.nama });

  User.register(USR, req.body.pass, (err) => {
    if (err)
      return res.json({
        type: "ERR_REG",
        message: err,
      });

    res.json({
      type: "SUCCESS",
      message: "Akun anda berhasil ditambahkan, silahkan login",
    });
  });
});

module.exports = Router;
