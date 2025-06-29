import { NextResponse } from "next/server";
import { getUserByEmail, verifyPassword, createSession } from "@/lib/redis";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    let email = "";
    let password = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email || "";
      password = body.password || "";
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData();
      email = (formData.get("email") as string) || "";
      password = (formData.get("password") as string) || "";
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user;
    try {
      user = await getUserByEmail(email);
    } catch (dbError) {
      console.error("Database error fetching user by email:", dbError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    let isValidPassword = false;
    try {
      isValidPassword = await verifyPassword(password, user.hashedPassword);
    } catch (verifyError) {
      console.error("Error verifying password:", verifyError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    let sessionId;
    try {
      sessionId = await createSession(user.id);
    } catch (sessionError) {
      console.error("Error creating session:", sessionError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const cookieStore = await cookies();
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const { hashedPassword, ...publicUser } = user;

    return NextResponse.json({ success: true, user: publicUser });
  } catch (error) {
    console.error("Login API error:", error instanceof Error ? error.stack : error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
