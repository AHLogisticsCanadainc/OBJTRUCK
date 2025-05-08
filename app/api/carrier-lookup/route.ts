// Correct base URL from the documentation
const API_BASE_URL = "https://mobile.fmcsa.dot.gov/qc/services"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const apiKey = searchParams.get("apiKey")

  if (!apiKey) {
    console.error("API request made without an API key")
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!endpoint) {
    console.error("API request made without an endpoint")
    return new Response(JSON.stringify({ error: "Missing endpoint" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Log the API key format (first few characters) for debugging
    console.log(`API Key format check: ${apiKey.substring(0, 4)}...`)

    // Make sure we're using the correct parameter name (webKey with capital K)
    // and properly encoding the API key
    const separator = endpoint.includes("?") ? "&" : "?"
    const url = `${API_BASE_URL}${endpoint}${separator}webKey=${encodeURIComponent(apiKey)}`

    console.log(`Making request to FMCSA API: ${url.replace(apiKey, "***")}`)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      // Add a cache: 'no-store' to prevent caching issues
      cache: "no-store",
    })

    // Log the full response for debugging
    const responseText = await response.text()
    console.log(`FMCSA API response status: ${response.status}`)
    console.log(`FMCSA API response body: ${responseText}`)

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.content) {
          errorMessage = errorData.content
        }
      } catch (e) {
        // If parsing fails, use the response text as the error message
        errorMessage = responseText || errorMessage
      }

      if (response.status === 401 || response.status === 403) {
        errorMessage = "Invalid or unauthorized API key. Please check your API key and try again."
      } else if (response.status === 404 && responseText.includes("Webkey not found")) {
        errorMessage = "API key not recognized. Please verify your API key is correct."
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse the response text as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing JSON response:", e)
      return new Response(JSON.stringify({ error: "Invalid JSON response from API" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching carrier data:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch carrier data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
