import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get("error")

  let errorMessage = "An unknown error occurred"
  let statusCode = 500

  switch (error) {
    case "Configuration":
      errorMessage = "Server configuration error"
      statusCode = 500
      break
    case "AccessDenied":
      errorMessage = "Access denied"
      statusCode = 403
      break
    case "Verification":
      errorMessage = "Invalid verification token"
      statusCode = 400
      break
    case "CredentialsSignin":
      errorMessage = "Invalid credentials"
      statusCode = 401
      break
    // Add more error cases as needed
    default:
      errorMessage = "Authentication error"
      statusCode = 400
  }

  return NextResponse.json(
    { error: errorMessage },
    {
      status: statusCode,
    },
  )
}
