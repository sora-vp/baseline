import type { DefaultSession, NextAuthConfig } from "next-auth";
import bcrypt from "bcrypt";
import { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { preparedGetUserByEmail } from "@sora-vp/db";

class UnexpectedLoginError extends CredentialsSignin {
  code = "Terjadi kesalahan yang terduga, mohon coba lagi nanti.";
}
class InvalidLoginError extends CredentialsSignin {
  code = "Mohon masukan email dan kata sandi!";
}
class InvalidUserOrPassword extends CredentialsSignin {
  code = "Email atau kata sandi salah!";
}

declare module "next-auth" {
  interface Session {
    user: {
      verifiedAt: Date | null;
      role: "admin" | "comittee" | null;
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
        email: { label: "Email" },
        password: { label: "Password" },
      },
      async authorize(credentials) {
        try {
        if (!credentials.email || !credentials.password)
          throw new InvalidLoginError();

        const user = await preparedGetUserByEmail.execute({
          email: credentials.email,
        });

        if (!user) throw new InvalidUserOrPassword();

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValidPassword) throw new InvalidUserOrPassword();

        return {
          name: user.name,
          email: user.email,
        };
        } catch (_) {
          throw new InvalidUserOrPassword;
          
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token }) {
      return token;
    },
    async session({ session }) {
      const user = await preparedGetUserByEmail.execute({
        email: session.user.email,
      });

      session.user.role = user.role;
      session.user.verifiedAt = user.verifiedAt;

      return session;
    },
  },
} satisfies NextAuthConfig;
