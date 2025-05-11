"use server"

import { Resend } from "resend"
import { getQuoteWithOptions } from "@/lib/email-utils"
import { supabase } from "@/lib/database"
import { revalidatePath } from "next/cache"

// Check if Resend API key is available from environment variable
const isResendConfigured = !!process.env.RESEND_API_KEY
if (!isResendConfigured) {
  console.warn("Resend API key is not configured. Email functionality will be limited.")
}

// Initialize Resend with the environment variable
const resend = isResendConfigured ? new Resend(process.env.RESEND_API_KEY) : null

// Unsubscribe form URL
const UNSUBSCRIBE_URL = "https://forms.gle/4CFRBwRcBsz2Jz3t5"

/**
 * Send a quote email to a client
 */
export async function sendQuoteEmail(
  quoteId: string,
  clientEmail: string,
  customMessage?: string,
  ccRecipients: string[] = [],
  bccRecipients: string[] = [],
  recipientName = "Valued Customer",
) {
  try {
    console.log(`Starting sendQuoteEmail for quote ID: ${quoteId}`)

    // Check if Resend API key is configured
    if (!isResendConfigured) {
      console.error("Resend API key is not configured")
      return {
        success: false,
        error: "Email service is not configured. Please add RESEND_API_KEY to your environment variables.",
      }
    }

    // Validate quoteId
    if (!quoteId) {
      console.error("Invalid quote ID provided:", quoteId)
      return {
        success: false,
        error: "Invalid quote ID provided",
      }
    }

    // Get the quote data with options
    console.log(`Fetching quote data for ID: ${quoteId}`)
    const quoteData = await getQuoteWithOptions(quoteId)

    if (!quoteData) {
      // Check if the quote exists at all
      const { data: basicQuoteData, error: basicQuoteError } = await supabase
        .from("quotes")
        .select("id, client_id")
        .eq("id", quoteId)
        .single()

      if (basicQuoteError || !basicQuoteData) {
        console.error("Quote not found in database:", basicQuoteError || "No data returned")
        return {
          success: false,
          error: "Quote not found in database",
        }
      } else {
        console.error("Quote exists but failed to load with options. Quote data:", basicQuoteData)
        return {
          success: false,
          error: "Failed to load quote with options",
        }
      }
    }

    // Validate that the quote has the necessary data
    if (!quoteData.origin || !quoteData.destination) {
      console.error("Quote is missing required fields:", {
        hasOrigin: !!quoteData.origin,
        hasDestination: !!quoteData.destination,
      })
      return {
        success: false,
        error: "Quote is missing required information (origin/destination)",
      }
    }

    console.log(`Quote data retrieved successfully:`, {
      id: quoteData.id,
      reference: quoteData.reference,
      optionsCount: quoteData.options?.length || 0,
      clientId: quoteData.client_id,
    })

    // Generate the plain text version of the email
    const plainText = generatePlainTextEmail(quoteData, customMessage, recipientName)

    // Generate the HTML version of the email
    const htmlContent = generateHtmlEmail(quoteData, customMessage, recipientName)

    // Send the email using Resend
    console.log(
      `Sending email to ${clientEmail} with CC: ${ccRecipients.join(", ")} and BCC: ${bccRecipients.join(", ")}`,
    )
    const { data, error } = await resend.emails.send({
      from: "A.H Logistics <gurpreet@logisticcanada.ca>",
      to: [clientEmail],
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
      subject: `Quote ${quoteData.reference || quoteData.id.substring(0, 8)} from A.H Logistics`,
      html: htmlContent,
      text: plainText,
    })

    if (error) {
      console.error("Error sending email:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log("Email sent successfully, updating quote status")

    // Update the quote with sent_email status
    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        sent_email: "sent",
        sent_email_at: new Date().toISOString(),
      })
      .eq("id", quoteId)

    if (updateError) {
      console.error("Error updating quote status:", updateError)
      throw new Error(`Failed to update quote status: ${updateError.message}`)
    }

    // Revalidate the quotes page to reflect the changes
    revalidatePath("/dashboard")

    console.log("Quote email process completed successfully")
    return { success: true, data }
  } catch (error) {
    console.error("Error in sendQuoteEmail:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Generate a plain text version of the email
 */
function generatePlainTextEmail(quote: any, customMessage?: string, recipientName = "Valued Customer"): string {
  // Format currency for plain text
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Format date for plain text
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not set"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  // Find the recommended option if any
  const recommendedOption = quote.options?.find((option: any) => option.is_recommended)

  // Sort options to put recommended first
  const sortedOptions = [...(quote.options || [])].sort((a: any, b: any) => {
    if (a.is_recommended && !b.is_recommended) return -1
    if (!a.is_recommended && b.is_recommended) return 1
    return 0
  })

  let text = `A.H Logistics Canada Inc.\nTransportation Quote\n\n`

  // Add greeting and custom message if provided
  text += `Dear ${recipientName},\n\n`

  if (customMessage) {
    text += `${customMessage}\n\n`
  } else {
    // Only add the default intro if no custom message is provided
    text += `Thank you for your interest in A.H Logistics Canada Inc. We are pleased to provide you with the following transportation quote:\n\n`
  }

  text += `Quote: ${quote.reference || quote.id.substring(0, 8)}\n`
  text += `Origin: ${quote.origin}\n`
  text += `Destination: ${quote.destination}\n`
  text += `Quote Date: ${formatDate(quote.date)}\n`
  text += `Valid Until: ${formatDate(new Date(new Date(quote.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString())}\n\n`

  text += `AVAILABLE OPTIONS:\n\n`

  if (sortedOptions.length > 0) {
    sortedOptions.forEach((option: any, index: number) => {
      text += `Option ${index + 1}\n`
      if (option.is_recommended) {
        text += `*** RECOMMENDED ***\n`
      }
      text += `Carrier: ${option.carrier || "Not specified"}\n`
      text += `Equipment Type: ${option.equipment_type || "Not specified"}\n`
      text += `Transit Time: ${option.transit_time || "Not specified"}\n`
      text += `Pickup Date: ${formatDate(option.pickup_date)}\n`
      text += `Delivery Date: ${formatDate(option.delivery_date)}\n`
      text += `Total Miles: ${option.distance ? `${option.distance} miles` : "Not specified"}\n`
      text += `Weight: ${option.weight ? `${option.weight} lbs` : "Not specified"}\n`

      if (option.description) {
        text += `Description: ${option.description}\n`
      }

      if (option.notes) {
        text += `Notes: ${option.notes}\n`
      }

      text += `\n`
    })
  } else {
    text += `No options are currently available for this quote.\n\n`
  }

  text += `To accept this quote, you can either reply to this email or accept the quote in the "A.H Quotes" section of your client portal at portal.logisticcanada.ca.\n\n`
  text += `If you have any questions, please contact us at:\n`
  text += `Phone: 647-962-4240\n`
  text += `\n`

  text += `Terms and Conditions:\n`
  text += `This quote is valid for 30 days from the date of issue. Rates are subject to availability at the time of booking. Additional charges may apply for detention, layover, or other accessorial services.\n\n`
  text += `Thank you for considering A.H Logistics Canada Inc. for your transportation needs.\n\n`

  text += `© ${new Date().getFullYear()} A.H Logistics Canada Inc. All rights reserved.\n\n`

  // Add unsubscribe link
  text += `To unsubscribe from future emails, please visit: ${UNSUBSCRIBE_URL}\n`

  return text
}

/**
 * Generate an HTML version of the email
 */
function generateHtmlEmail(quote: any, customMessage?: string, recipientName = "Valued Customer"): string {
  // Format currency for HTML
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Format date for HTML
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not set"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  // Find the recommended option if any
  const recommendedOption = quote.options?.find((option: any) => option.is_recommended)

  // Sort options to put recommended first
  const sortedOptions = [...(quote.options || [])].sort((a: any, b: any) => {
    if (a.is_recommended && !b.is_recommended) return -1
    if (!a.is_recommended && b.is_recommended) return 1
    return 0
  })

  // Function to format custom message with line breaks
  const formatCustomMessage = (message?: string): string => {
    if (!message) return ""
    return message
      .split("\n")
      .map((line) => `${line}<br/>`)
      .join("")
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transportation Quote</title>
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #333333; background-color: #f7f7f7; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f7f7f7" style="border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <!-- Email Container -->
            <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-collapse: collapse; box-shadow: 0 3px 6px rgba(0,0,0,0.1); border-radius: 6px; max-width: 600px; width: 100%;">
              <!-- Header -->
              <tr>
                <td style="background-color: #c41c1c; padding: 25px 30px; border-radius: 6px 6px 0 0;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <tr>
                      <td>
                        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">A.H Logistics Canada Inc.</h1>
                        <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Transportation Quote</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin-top: 0; font-size: 16px; line-height: 1.5;">Dear ${recipientName},</p>
  `

  // Add custom message if provided, otherwise use default intro
  if (customMessage) {
    html += `
                  <div style="margin-bottom: 25px; padding: 15px; border-left: 3px solid #c41c1c; background-color: #f9f9f9; color: #555;">
                    ${formatCustomMessage(customMessage)}
                  </div>
    `
  } else {
    // Only add the default intro if no custom message is provided
    html += `
                  <p style="font-size: 16px; line-height: 1.5; color: #555;">Thank you for your interest in A.H Logistics Canada Inc. We are pleased to provide you with the following transportation quote:</p>
    `
  }

  html += `
                  <!-- Quote Summary -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 25px 0; background-color: #f9f9f9; border-radius: 6px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px;">
                        <h2 style="margin-top: 0; margin-bottom: 15px; color: #333; font-size: 18px; border-bottom: 1px solid #e1e1e1; padding-bottom: 10px;">Quote ${quote.reference || quote.id.substring(0, 8)}</h2>
                        
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                          <tr>
                            <td width="30%" style="padding: 8px 0; font-weight: 600; color: #555; font-size: 14px;">Origin:</td>
                            <td style="padding: 8px 0; font-size: 14px;">${quote.origin}</td>
                          </tr>
                          <tr>
                            <td width="30%" style="padding: 8px 0; font-weight: 600; color: #555; font-size: 14px;">Destination:</td>
                            <td style="padding: 8px 0; font-size: 14px;">${quote.destination}</td>
                          </tr>
                          <tr>
                            <td width="30%" style="padding: 8px 0; font-weight: 600; color: #555; font-size: 14px;">Quote Date:</td>
                            <td style="padding: 8px 0; font-size: 14px;">${formatDate(quote.date)}</td>
                          </tr>
                          <tr>
                            <td width="30%" style="padding: 8px 0; font-weight: 600; color: #555; font-size: 14px;">Valid Until:</td>
                            <td style="padding: 8px 0; font-size: 14px;">${formatDate(new Date(new Date(quote.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString())}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  
  `

  if (sortedOptions.length > 0) {
    // Only show the first 2 options (changed from 3)
    const displayOptions = sortedOptions.slice(0, 2)

    // If there's only one option, don't label it as "Option 1" or use "Available Options" heading
    if (sortedOptions.length === 1) {
      const option = sortedOptions[0]
      const isRecommended = option.is_recommended

      html += `
                  <!-- Single Option -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px; border: ${isRecommended ? "2px solid #c41c1c" : "1px solid #e1e1e1"}; border-radius: 6px; overflow: hidden; background-color: ${isRecommended ? "#fff9f9" : "white"};">
    `

      if (isRecommended) {
        html += `
                    <tr>
                      <td style="padding: 10px 20px; background-color: #c41c1c;">
                        <span style="display: inline-block; color: white; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">RECOMMENDED</span>
                      </td>
                    </tr>
      `
      }

      html += `
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Carrier:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.carrier || "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Equipment Type:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.equipment_type || "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Transit Time:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.transit_time || "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Pickup Date:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${formatDate(option.pickup_date)}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Delivery Date:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${formatDate(option.delivery_date)}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Total Miles:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.distance ? `${option.distance} miles` : "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Weight:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.weight ? `${option.weight} lbs` : "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Total Rate:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #2e7d32; font-size: 14px;">${formatCurrency(option.total_rate)}</td>
                          </tr>
                        </table>
    `

      if (option.description) {
        html += `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                          <p style="margin: 0 0 5px; font-weight: 600; color: #555; font-size: 14px;">Description:</p>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555;">${option.description}</p>
                        </div>
      `
      }

      if (option.notes) {
        html += `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                          <p style="margin: 0 0 5px; font-weight: 600; color: #555; font-size: 14px;">Notes:</p>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555;">${option.notes}</p>
                        </div>
      `
      }

      html += `
                      </td>
                    </tr>
                  </table>
    `
    } else {
      // Multiple options - show heading and label each option
      html += `<h3 style="color: #333; font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e1e1e1; padding-bottom: 10px;">Available Options</h3>`

      displayOptions.forEach((option, index) => {
        const isRecommended = option.is_recommended

        html += `
                  <!-- Option ${index + 1} -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px; border: ${isRecommended ? "2px solid #c41c1c" : "1px solid #e1e1e1"}; border-radius: 6px; overflow: hidden; background-color: ${isRecommended ? "#fff9f9" : "white"};">
      `

        if (isRecommended) {
          html += `
                    <tr>
                      <td style="padding: 10px 20px; background-color: #c41c1c;">
                        <span style="display: inline-block; color: white; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">RECOMMENDED</span>
                      </td>
                    </tr>
        `
        }

        html += `
                    <tr>
                      <td style="padding: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #333; font-size: 16px;">Option ${index + 1}</h4>
                        
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Carrier:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.carrier || "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Equipment Type:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.equipment_type || "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Transit Time:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.transit_time || "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Pickup Date:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${formatDate(option.pickup_date)}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Delivery Date:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${formatDate(option.delivery_date)}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Total Miles:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.distance ? `${option.distance} miles` : "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Weight:</td>
                            <td style="padding: 6px 0; font-size: 14px;">${option.weight ? `${option.weight} lbs` : "Not specified"}</td>
                          </tr>
                          <tr>
                            <td width="40%" style="padding: 6px 0; font-weight: 600; color: #555; font-size: 14px;">Total Rate:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #2e7d32; font-size: 14px;">${formatCurrency(option.total_rate)}</td>
                          </tr>
                        </table>
      `

        if (option.description) {
          html += `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                          <p style="margin: 0 0 5px; font-weight: 600; color: #555; font-size: 14px;">Description:</p>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555;">${option.description}</p>
                        </div>
        `
        }

        if (option.notes) {
          html += `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                          <p style="margin: 0 0 5px; font-weight: 600; color: #555; font-size: 14px;">Notes:</p>
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555;">${option.notes}</p>
                        </div>
        `
        }

        html += `
                      </td>
                    </tr>
                  </table>
      `
      })
    }

    // If there are more than 2 options, add a message about viewing the rest on the portal
    if (sortedOptions.length > 2) {
      html += `
                  <div style="padding: 15px; background-color: #f9f9f9; border-radius: 6px; margin-bottom: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555;">
                      A.H Logistics has provided more options for this quote. To see all the rates available for this lane, please visit the portal.
                    </p>
                  </div>
    `
    }
  } else {
    html += `
                  <p style="font-size: 14px; color: #666; font-style: italic; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">No options are currently available for this quote.</p>
  `
  }

  html += `
                  <!-- Call to Action -->
                  <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 6px;">
                    <p style="margin-top: 0; font-size: 14px; line-height: 1.5; color: #555;">To accept this quote, you can either reply to this email or accept the quote in the <strong>"A.H Quotes"</strong> section of your client portal at <a href="https://portal.logisticcanada.ca" style="color: #555; text-decoration: underline;">portal.logisticcanada.ca</a>.</p>
                    
                    <p style="margin-bottom: 5px; font-size: 14px; line-height: 1.5; color: #555;">If you have any questions, please contact us at:</p>
                    <p style="margin-top: 0; font-weight: 600; font-size: 14px; line-height: 1.5; color: #333;">
                      Phone: 647-962-4240<br/>
                    </p>
                  </div>

                  <!-- Terms and Conditions -->
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1;">
                    <p style="font-size: 12px; line-height: 1.5; color: #777;">
                      <strong>Terms and Conditions:</strong><br/>
                      This quote is valid for 30 days from the date of issue. Rates are subject to availability at the time of booking. Additional charges may apply for detention, layover, or other accessorial services.
                    </p>
                    <p style="font-size: 12px; line-height: 1.5; color: #777;">Thank you for considering A.H Logistics Canada Inc. for your transportation needs.</p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f2f2f2; padding: 20px 30px; border-top: 3px solid #c41c1c; border-radius: 0 0 6px 6px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #777;">
                          © ${new Date().getFullYear()} A.H Logistics Canada Inc. All rights reserved.
                        </p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                          <a href="${UNSUBSCRIBE_URL}" style="color: #999; text-decoration: underline;">Unsubscribe</a> from future emails.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  return html
}

/**
 * Mark a quote email as unsent
 */
export async function markQuoteEmailAsUnsent(quoteId: string) {
  try {
    console.log(`Marking quote ${quoteId} as unsent`)

    // Update the quote to remove sent_email status
    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        sent_email: null,
        sent_email_at: null,
      })
      .eq("id", quoteId)

    if (updateError) {
      console.error("Error updating quote status:", updateError)
      throw new Error(`Failed to update quote status: ${updateError.message}`)
    }

    console.log(`Successfully marked quote ${quoteId} as unsent`)

    // Revalidate the quotes page to reflect the changes
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in markQuoteEmailAsUnsent:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
