const { User } = require("../../models");
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
            return done(null, false, {
              message: "Akun tidak terdaftar !",
              type: "USER_NOT_FOUND",
            });

          return user.authenticate(pass, (_, same) => {
            if (!same)
              return done(null, false, {
                message: "Kata sandi salah !",
                type: "PASS_WRONG",
              });

            return done(null, user);
          });
        });
      }
    )
  );
};
