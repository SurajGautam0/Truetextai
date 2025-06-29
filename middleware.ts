import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/ai-checker",
  "/paraphraser",
  "/assignment-writer",
  "/editor",
  "/models",
  "/premium-features",
  "/account",
  "/admin",
]

// Admin routes that require admin role
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for Next.js internals and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next()
  }

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Check if the path is admin-only
  const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // For Firebase auth, we'll let the client-side handle authentication checks
  // The middleware will only handle basic redirects for login/signup pages
  // when user is already authenticated (this will be handled by the client-side auth context)

  // Redirect to dashboard if already logged in and trying to access login/signup
  // This will be handled by the client-side auth context, so we'll just pass through
  if ((pathname === "/login" || pathname === "/signup")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
}
