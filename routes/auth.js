const express = require("express");
const passport = require("passport");

const Router = express.Router();

Router.post("/login", passport.authenticate("local"), (req, res) => {
  const user = req.user;

  if (!user)
    return res.status(404).json({
      msg: "Akun tidak terdaftar !",
    });

  return res.status(200).json({
    msg: "Berhasil login",
  });
});

module.exports = Router;
