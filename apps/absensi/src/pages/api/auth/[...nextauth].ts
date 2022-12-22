import bcrypt from "bcrypt";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDatabase } from "../../../utils/database";

import { UserModel } from "../../../models";

export const authOptions: NextAuthOptions = {
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

      // @ts-ignore
      async authorize(credentials: Record<"email" | "password", string>) {
        await connectDatabase();

        const user = await UserModel.getByEmail(credentials.email);

        if (!user) throw new Error("Pengguna tidak ditemukan!");

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) throw new Error("Kata sandi salah!");

        return {
          id: user._id,
          email: user.email,
        };
      },
    }),
  ],
};

export default NextAuth(authOptions);
