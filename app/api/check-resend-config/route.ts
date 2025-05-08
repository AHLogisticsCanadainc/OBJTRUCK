import { NextResponse } from "next/server"

export async function GET() {
  const isConfigured = !!process.env.RESEND_API_KEY

  // Don't treat this as an error condition, just report the status
  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? "Resend API is configured"
      : "Resend API is not configured. Email functionality will be limited.",
  })
}
