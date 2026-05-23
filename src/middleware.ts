import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;
      if (!token) return false;
      if (path.startsWith("/super-admin")) return token.role === "SUPER_ADMIN";
      return true;
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/api/qr/:path*", "/api/reviews/:path*", "/api/manual-reviews/:path*", "/api/export/:path*", "/api/super-admin/:path*"]
};
