import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createUser, getUserByEmail, createSession } from "@/lib/redis"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Check for OAuth errors
    if (error) {
      console.error("GitHub OAuth error:", error)
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
    }

    // Validate required parameters
    if (!code || !state) {
      console.error("Missing required OAuth parameters")
      return NextResponse.redirect(new URL("/login?error=Invalid+OAuth+response", request.url))
    }

    // Verify state to prevent CSRF
    const storedState = cookies().get("oauth_state")?.value
    if (!storedState || storedState !== state) {
      console.error("OAuth state mismatch")
      return NextResponse.redirect(new URL("/login?error=Invalid+OAuth+state", request.url))
    }

    // Exchange code for token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange error:", errorData)
      return NextResponse.redirect(new URL("/login?error=Token+exchange+failed", request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user profile
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!profileResponse.ok) {
      console.error("Profile fetch error:", await profileResponse.text())
      return NextResponse.redirect(new URL("/login?error=Profile+fetch+failed", request.url))
    }

    const profileData = await profileResponse.json()

    // GitHub might not provide email in the profile, so we need to fetch emails separately
    let email = profileData.email

    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json()
        const primaryEmail = emails.find((e: any) => e.primary)
        email = primaryEmail ? primaryEmail.email : emails[0]?.email
      }
    }

    if (!email) {
      console.error("No email found in GitHub profile")
      return NextResponse.redirect(new URL("/login?error=No+email+found", request.url))
    }

    const name = profileData.name || profileData.login

    // Check if user exists
    let user = await getUserByEmail(email)

    // Create user if not exists
    if (!user) {
      // Generate a random password for OAuth users
      const randomPassword = Math.random().toString(36).slice(-10)
      const newUser = await createUser(name, email, randomPassword)

      if (!newUser) {
        console.error("Failed to create user")
        return NextResponse.redirect(new URL("/login?error=User+creation+failed", request.url))
      }

      user = await getUserByEmail(email)
    }

    if (!user) {
      console.error("User not found after creation")
      return NextResponse.redirect(new URL("/login?error=Authentication+failed", request.url))
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Set cookies
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Clear the oauth_state cookie
    response.cookies.set("oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=Authentication+failed", request.url))
  }
}
