"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function testResendConnection() {
  try {
    // Check if the API key is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        message: "Resend API key is not configured. Please add RESEND_API_KEY to your environment variables.",
      }
    }

    // Test the connection by getting account details
    const { data, error } = await resend.domains.list()

    if (error) {
      console.error("Resend API error:", error)
      return {
        success: false,
        message: `Error connecting to Resend: ${error.message}`,
      }
    }

    return {
      success: true,
      message: "Successfully connected to Resend API",
      domains: data?.length || 0,
    }
  } catch (error) {
    console.error("Unexpected error testing Resend connection:", error)
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
