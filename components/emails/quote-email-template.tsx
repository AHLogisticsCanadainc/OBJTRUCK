import type { Quote } from "@/types/quotes"
import { formatCurrency, formatDate } from "@/lib/email-utils"
import React from "react"

interface QuoteEmailTemplateProps {
  quote: Quote
  customMessage?: string
}

export const QuoteEmailTemplate: React.FC<QuoteEmailTemplateProps> = ({ quote, customMessage }) => {
  // Find the recommended option if any
  const recommendedOption = quote.options?.find((option) => option.is_recommended)

  // Sort options to put recommended first
  const sortedOptions = [...(quote.options || [])].sort((a, b) => {
    if (a.is_recommended && !b.is_recommended) return -1
    if (!a.is_recommended && b.is_recommended) return 1
    return 0
  })

  // Function to render custom message with line breaks
  const renderCustomMessage = (message?: string) => {
    if (!message) return null

    return message.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ))
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#c41c1c", color: "white", padding: "20px", textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>A.H Logistics Canada Inc.</h1>
        <p style={{ margin: "5px 0 0" }}>Transportation Quote</p>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Custom Message Section */}
        {customMessage && (
          <div style={{ marginBottom: "20px", borderLeft: "3px solid #c41c1c", paddingLeft: "10px" }}>
            {renderCustomMessage(customMessage)}
          </div>
        )}

        <p>Dear {quote.customerContact || "Valued Customer"},</p>

        <p>
          Thank you for your interest in A.H Logistics Canada Inc. We are pleased to provide you with the following
          transportation quote:
        </p>

        <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
          <h2 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px", marginTop: 0 }}>
            Quote {quote.reference || quote.id.substring(0, 8)}
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>Origin:</td>
                <td style={{ padding: "8px 0" }}>{quote.origin}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>Destination:</td>
                <td style={{ padding: "8px 0" }}>{quote.destination}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>Quote Date:</td>
                <td style={{ padding: "8px 0" }}>{formatDate(quote.date)}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>Valid Until:</td>
                <td style={{ padding: "8px 0" }}>
                  {formatDate(new Date(new Date(quote.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>Available Options</h3>

        {sortedOptions.length > 0 ? (
          <div>
            {sortedOptions.map((option, index) => (
              <div
                key={option.id}
                style={{
                  border: option.is_recommended ? "2px solid #c41c1c" : "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: option.is_recommended ? "#fff9f9" : "white",
                }}
              >
                {option.is_recommended && (
                  <div
                    style={{
                      backgroundColor: "#c41c1c",
                      color: "white",
                      padding: "5px 10px",
                      display: "inline-block",
                      borderRadius: "3px",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    RECOMMENDED
                  </div>
                )}

                <h4 style={{ margin: "0 0 10px" }}>
                  Option {index + 1}: {option.name}
                </h4>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "5px 0", fontWeight: "bold", width: "40%" }}>Carrier:</td>
                      <td style={{ padding: "5px 0" }}>{option.carrier || "Not specified"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "5px 0", fontWeight: "bold" }}>Equipment Type:</td>
                      <td style={{ padding: "5px 0" }}>{option.equipment_type || "Not specified"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "5px 0", fontWeight: "bold" }}>Transit Time:</td>
                      <td style={{ padding: "5px 0" }}>{option.transit_time || "Not specified"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "5px 0", fontWeight: "bold" }}>Pickup Date:</td>
                      <td style={{ padding: "5px 0" }}>{formatDate(option.pickup_date)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "5px 0", fontWeight: "bold" }}>Delivery Date:</td>
                      <td style={{ padding: "5px 0" }}>{formatDate(option.delivery_date)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "5px 0", fontWeight: "bold" }}>Total Rate:</td>
                      <td style={{ padding: "5px 0", fontWeight: "bold", color: "#c41c1c" }}>
                        {formatCurrency(option.total_rate)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {option.description && (
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ fontWeight: "bold", margin: "5px 0" }}>Description:</p>
                    <p style={{ margin: "5px 0" }}>{option.description}</p>
                  </div>
                )}

                {option.features && (
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ fontWeight: "bold", margin: "5px 0" }}>Features:</p>
                    <p style={{ margin: "5px 0" }}>{option.features}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No options are currently available for this quote.</p>
        )}

        <div style={{ marginTop: "30px" }}>
          <p>To accept this quote or if you have any questions, please reply to this email or contact us at:</p>
          <p style={{ fontWeight: "bold" }}>
            Phone: (123) 456-7890
            <br />
            Email: gurpreet@logisticcanada.ca
          </p>
        </div>

        <div
          style={{
            marginTop: "30px",
            borderTop: "1px solid #ddd",
            paddingTop: "20px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <p>
            <strong>Terms and Conditions:</strong>
            <br />
            This quote is valid for 30 days from the date of issue. Rates are subject to availability at the time of
            booking. Additional charges may apply for detention, layover, or other accessorial services.
          </p>
          <p>Thank you for considering A.H Logistics Canada Inc. for your transportation needs.</p>
        </div>
      </div>

      <div style={{ backgroundColor: "#f5f5f5", padding: "20px", textAlign: "center", borderTop: "3px solid #c41c1c" }}>
        <p style={{ margin: 0, fontSize: "12px" }}>
          © {new Date().getFullYear()} A.H Logistics Canada Inc. All rights reserved.
        </p>
      </div>
    </div>
  )
}
