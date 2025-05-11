import { NextResponse } from "next/server"

export async function GET() {
  // Check if the Resend API key is configured in the environment variables
  const isConfigured = !!process.env.RESEND_API_KEY

  // Return a simple response indicating whether the API key is configured
  return NextResponse.json({
    configured: isConfigured,
    // Don't include the actual API key in the response for security
  })
}
