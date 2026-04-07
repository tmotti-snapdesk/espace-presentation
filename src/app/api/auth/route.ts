import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Snapdesk2026";
const SESSION_TOKEN = crypto
  .createHash("sha256")
  .update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}:snapdesk-session`)
  .digest("hex");

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("snapdesk_session", SESSION_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("snapdesk_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

// Export the token for middleware verification
export { SESSION_TOKEN };
