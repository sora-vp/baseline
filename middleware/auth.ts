import nextConnect from "next-connect";
import passport from "@/lib/passport";
import session from "@/lib/session";

import type { NextApiRequest, NextApiResponse } from "next";

const auth = nextConnect<NextApiRequest, NextApiResponse>()
  .use(
    session({
      name: process.env.SESS_NAME as string,
      secret: process.env.TOKEN_SECRET as string,
      cookie: {
        maxAge: 60 * 60 * 8, // 8 hours,
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // Secure false karena jika di akses dari local tidak ada https,
        // bisa diusahakan tetapi akan memakan waktu
        secure: false,
        path: "/",
        sameSite: "lax",
      },
    })
  )
  .use(passport.initialize())
  .use(passport.session());

export default auth;
