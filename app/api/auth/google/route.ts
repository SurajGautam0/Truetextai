import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      console.error("Google OAuth credentials not configured")
      return NextResponse.redirect(new URL("/login?error=OAuth+configuration+error", request.url))
    }

    // Create OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("scope", "email profile")
    authUrl.searchParams.append("prompt", "select_account")

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)
    authUrl.searchParams.append("state", state)

    // Store state in cookie for verification
    const response = NextResponse.redirect(authUrl)
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(new URL("/login?error=Authentication+failed", request.url))
  }
}
