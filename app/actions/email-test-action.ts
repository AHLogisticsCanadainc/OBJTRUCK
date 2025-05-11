"use server"

import { Resend } from "resend"
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

export async function testResendConnection() {
  try {
    // Get API key from database
    const apiKey = await getResendApiKey()

    // Check if the API key is configured
    if (!apiKey) {
      return {
        success: false,
        message: "Resend API key is not configured in the database (ID: 2). Please add a valid API key.",
      }
    }

    // Initialize Resend with the API key from the database
    const resend = new Resend(apiKey)

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
      message: "Successfully connected to Resend API using key from database (ID: 2)",
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
