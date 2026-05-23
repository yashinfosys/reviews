import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!hasDatabaseUrl()) {
            console.error("AUTH_AUTHORIZE_ERROR", "DATABASE_URL is missing");
            return null;
          }
          if (!credentials?.email || !credentials.password) return null;
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user) return null;
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessId: user.businessId || null
          } as never;
        } catch (error) {
          console.error("AUTH_AUTHORIZE_ERROR", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as never as { role: Role }).role;
        token.businessId = (user as never as { businessId?: string | null }).businessId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as never as { id?: string; role?: string; businessId?: string | null }).id = typeof token.sub === "string" ? token.sub : "";
        (session.user as never as { role?: string; businessId?: string | null }).role = typeof token.role === "string" ? token.role : undefined;
        (session.user as never as { businessId?: string | null }).businessId = typeof token.businessId === "string" ? token.businessId : null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error"
  }
};
