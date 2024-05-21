import type { DefaultSession, NextAuthConfig } from "next-auth";
// import { AuthError } from "next-auth"
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";

import { preparedGetUserByEmail } from "@sora-vp/db";

// class UserNotFoundError extends AuthError {
//   static type = "UserNotFoundError";
// }

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password)
          throw new Error("Dibutuhkan email dan password!");

        const user = await preparedGetUserByEmail.execute({
          email: credentials.email,
        });

        if (!user) throw new Error("Pengguna tidak ditemukan!");

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValidPassword) throw new Error("Kata sandi salah!");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          verifiedAt: user.verifiedAt,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
