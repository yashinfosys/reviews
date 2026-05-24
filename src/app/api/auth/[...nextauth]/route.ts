import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";

function isMigrationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021" || error.code === "P2022";
  }
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("does not exist") || message.includes("passwordHash") || message.includes("User");
}

const handler = NextAuth({
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "temporary-dev-secret",

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = credentials.email.toLowerCase().trim();

          const user = await prisma.user.findUnique({
            where: {
              email,
            },
            include: {
              business: { select: { status: true, deletedAt: true } }
            }
          });

          if (!user || !user.isActive) return null;
          if (user.role !== Role.SUPER_ADMIN && (!user.business || user.business.status !== "ACTIVE" || user.business.deletedAt)) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            businessId: user.businessId,
          };
        } catch (error) {
          if (isMigrationError(error)) {
            console.error("AUTH_DATABASE_NOT_MIGRATED", error);
            throw new Error("DatabaseNotMigrated");
          }
          console.error("AUTH_ERROR", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.businessId = user.businessId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role || Role.STAFF;
        session.user.businessId = token.businessId || null;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
