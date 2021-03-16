const { User } = require("../models");
const LocalStrategy = require("passport-local").Strategy;

// Local Strategy
module.exports = (passport) => {
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "pass" },
      (email, pass, done) => {
        User.findOne({ email }, (err, user) => {
          if (err) return done(err);

          if (!user)
            return done(null, false, { message: "Akun tidak terdaftar !" });

          if (!user.verifyPassword(pass))
            return done(null, false, {
              message: "Kata sandi salah !",
            });

          return done(null, user);
        });
      }
    )
  );
};
