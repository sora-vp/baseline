import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Types } from "mongoose";

import User from "@/models/User";

passport.serializeUser((user, done) =>
  done(null, (user as { _id: Types.ObjectId })._id)
);

passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({ _id: id });
  done(null, user);
});

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "Akun tidak terdaftar !",
            });
          } else {
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, {
                  message: "Kata sandi salah !",
                });
              }
            });
          }
        })
        .catch((err) => {
          return done(null, false, { message: err });
        });
    }
  )
);

export default passport;
