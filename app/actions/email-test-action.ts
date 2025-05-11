"use server"

import { Resend } from "resend"

export async function testResendConnection() {
  try {
    // Check if the API key is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        message: "Resend API key is not configured in environment variables.",
      }
    }

    // Initialize Resend with the environment variable
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Test the connection by fetching domains
    const { data: domains, error } = await resend.domains.list()

    if (error) {
      return {
        success: false,
        message: `Error connecting to Resend: ${error.message}`,
      }
    }

    return {
      success: true,
      message: "Successfully connected to Resend API",
      domains: domains.length,
    }
  } catch (error) {
    console.error("Error testing Resend connection:", error)
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
