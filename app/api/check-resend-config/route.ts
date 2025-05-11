import { NextResponse } from "next/server"
import { supabase } from "@/lib/database"

async function getResendApiKey() {
  try {
    // Fetch from database - row ID 2 in the api_keys table
    const { data, error } = await supabase.from("api_keys").select("api_key").eq("id", 2).eq("is_active", true).single()

    if (error) {
      console.error("Error fetching Resend API key:", error)
      return null
    }

    if (!data || !data.api_key) {
      console.log("No active Resend API key found in database with ID 2")
      return null
    }

    return data.api_key
  } catch (err) {
    console.error("Error in getResendApiKey:", err)
    return null
  }
}

export async function GET() {
  const apiKey = await getResendApiKey()
  const isConfigured = !!apiKey

  // Don't treat this as an error condition, just report the status
  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? "Resend API is configured in the database (ID: 2)"
      : "Resend API is not configured in the database (ID: 2). Email functionality will be limited.",
  })
}
