import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // Inherit the Edge-safe config
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 Days
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          await dbConnect(); // Connect to DB only on the server
          const user = await User.findOne({ username: credentials.username });
          
          if (!user) return null;
          
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isMatch) return null;

          return { id: user._id.toString(), name: user.username };
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks, // Include the callbacks
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});