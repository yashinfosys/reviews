import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
        if (!credentials?.email || !credentials.password) return null;
        const user = await authenticate(credentials.email, credentials.password);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId || null
        } as never;
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
        (session.user as never as { id?: string; role?: string; businessId?: string | null }).id = token.sub as string;
        (session.user as never as { role?: string; businessId?: string | null }).role = token.role as string;
        (session.user as never as { businessId?: string | null }).businessId = token.businessId as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};
