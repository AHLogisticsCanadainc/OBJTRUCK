import type { Provider } from "@/hooks/use-ai-chat"

export function validateApiKey(provider: Provider, apiKey: string): boolean {
  // Basic validation patterns for different API keys
  // These are approximate and may need to be updated as providers change their formats

  switch (provider) {
    case "openai":
      // OpenAI API keys typically start with "sk-" and are 51 characters long
      return /^sk-[A-Za-z0-9]{48}$/.test(apiKey)

    case "gemini":
      // Google API keys are typically 39 characters
      return /^[A-Za-z0-9_-]{39}$/.test(apiKey)

    case "groq":
      // Groq API keys typically start with "gsk_" and are around 40-50 characters
      return /^gsk_[A-Za-z0-9]{30,50}$/.test(apiKey)

    case "grok":
      // Grok (xAI) API keys format - this is an approximation
      // Update this pattern based on actual Grok API key format
      return /^xai-[A-Za-z0-9]{30,50}$/.test(apiKey)

    case "local":
      // No validation needed for local LLM
      return true

    default:
      // For unknown providers, just check if the key is not empty
      return apiKey.trim().length > 0
  }
}
