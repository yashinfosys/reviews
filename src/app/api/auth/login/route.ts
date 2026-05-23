import { NextResponse } from "next/server";
import { authenticate, setSessionCookie, signSession } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const user = await authenticate(email, password);
  const wantsHtml = request.headers.get("accept")?.includes("text/html");
  if (!user) {
    if (wantsHtml) return NextResponse.redirect(new URL("/login?error=invalid", request.url), { status: 303 });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signSession(user);
  if (wantsHtml) {
    const response = NextResponse.redirect(new URL(user.role === "SUPER_ADMIN" ? "/super-admin" : "/admin", request.url), { status: 303 });
    response.cookies.set("reviewboost_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  }

  setSessionCookie(token);
  return NextResponse.json(user);
}
