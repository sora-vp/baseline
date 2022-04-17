import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Types } from "mongoose";

import User from "@/models/User";
import { connectDatabase } from "@/lib/db";

passport.serializeUser((user, done) =>
  done(null, (user as { _id: Types.ObjectId })._id)
);

passport.deserializeUser(async (id, done) => {
  await connectDatabase();
  const user = await User.findById(id);

  done(null, user);
});

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      await connectDatabase();

      await User.findOne({ email })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              status: 404,
              error: {
                typeStatus: "error",
                title: "Peringatan",
                description: "Akun tidak terdaftar!",
              },
            });
          } else {
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, {
                  status: 401,
                  error: {
                    typeStatus: "warning",
                    title: "Pemberitahuan",
                    description: "Kata sandi salah!",
                  },
                });
              }
            });
          }
        })
        .catch((err) => {
          return done(err, false);
        });
    }
  )
);

export default passport;
