"use client"

import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system" | "thinking"
  content: string
  timestamp: number
  isVisible?: boolean // To control visibility of thinking messages to the user
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

// Available Groq models
export type GroqModel = "llama3-8b-8192" | "llama3-70b-8192" | "mixtral-8x7b-32768"

// Available Gemini models
export type GeminiModel = "gemini-2.0-flash" | "gemini-2.0-pro"

// Available OpenAI models
export type OpenAIModel = "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo" | "gpt-4o"

// Available Grok models
export type GrokModel = "grok-1" | "grok-1.5-mini" | "grok-1.5"

// Provider types
export type Provider = "gemini" | "groq" | "openai" | "local" | "grok"

// Model types union
export type ModelType = GroqModel | GeminiModel | OpenAIModel | GrokModel | string

// Add to the ApiConfig interface
export interface ApiConfig {
  provider: Provider
  apiKey: string
  providerKeys: Record<Provider, string> // Add this to store keys for each provider
  model: ModelType
  endpoint?: string // For local LLM models
  instructions?: string
  enableThinking?: boolean
}

// Local storage keys
const CHAT_SESSIONS_KEY = "ai-chat-sessions"
const ACTIVE_SESSION_ID_KEY = "ai-chat-active-session"
const API_CONFIG_KEY = "ai-chat-api-config"
const INSTRUCTIONS_KEY = "ai-chat-instructions" // Add this line

// Default models
const DEFAULT_GROQ_MODEL: GroqModel = "llama3-8b-8192"
const DEFAULT_GEMINI_MODEL: GeminiModel = "gemini-2.0-flash"
const DEFAULT_OPENAI_MODEL: OpenAIModel = "gpt-3.5-turbo"
const DEFAULT_GROK_MODEL: GrokModel = "grok-1.5"

// Maximum number of previous messages to include for context
const MAX_CONTEXT_MESSAGES = 10

// Default thinking prompt to add to instructions
const THINKING_PROMPT = `
Before responding to the user's question, I want you to think step by step about:
1. What is the user really asking?
2. What information do I need to provide a complete answer?
3. What is the most logical way to structure my response?
4. Are there any potential misunderstandings I should address?

Begin your response with "Thinking:" followed by your step-by-step reasoning process. 
Then provide your final answer starting with "Answer:".
`

// Model display names
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // Groq models
  "llama3-8b-8192": "Llama 3 (8B)",
  "llama3-70b-8192": "Llama 3 (70B)",
  "mixtral-8x7b-32768": "Mixtral (8x7B)",

  // Gemini models
  "gemini-2.0-flash": "Gemini 2.0 Flash",
  "gemini-2.0-pro": "Gemini 2.0 Pro",

  // OpenAI models
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4": "GPT-4",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4o": "GPT-4o",

  // Grok models
  "grok-1": "Grok 1",
  "grok-1.5-mini": "Grok 1.5 Mini",
  "grok-1.5": "Grok 1.5",

  // Local model
  "local-model": "Local LLM",
}

export function useAiChat() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data from local storage on mount
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(CHAT_SESSIONS_KEY)
      const storedActiveSessionId = localStorage.getItem(ACTIVE_SESSION_ID_KEY)
      const storedApiConfig = localStorage.getItem(API_CONFIG_KEY)

      if (storedSessions) {
        setChatSessions(JSON.parse(storedSessions))
      }

      if (storedActiveSessionId) {
        setActiveSessionId(storedActiveSessionId)
      }

      if (storedApiConfig) {
        const parsedConfig = JSON.parse(storedApiConfig)

        // Initialize providerKeys if not present (for backwards compatibility)
        if (!parsedConfig.providerKeys) {
          parsedConfig.providerKeys = {
            gemini: "",
            groq: "",
            openai: "",
            grok: "",
            local: "",
          }

          // If we have an existing apiKey, store it for the current provider
          if (parsedConfig.apiKey && parsedConfig.provider) {
            parsedConfig.providerKeys[parsedConfig.provider] = parsedConfig.apiKey
          }
        }

        // Ensure model is set (for backward compatibility)
        if (!parsedConfig.model) {
          if (parsedConfig.provider === "groq") {
            parsedConfig.model = DEFAULT_GROQ_MODEL
          } else if (parsedConfig.provider === "gemini") {
            parsedConfig.model = DEFAULT_GEMINI_MODEL
          } else if (parsedConfig.provider === "openai") {
            parsedConfig.model = DEFAULT_OPENAI_MODEL
          } else if (parsedConfig.provider === "grok") {
            parsedConfig.model = DEFAULT_GROK_MODEL
          } else if (parsedConfig.provider === "local") {
            parsedConfig.model = "local-model"
          }
        }

        // Set default enableThinking if not present
        if (parsedConfig.enableThinking === undefined) {
          parsedConfig.enableThinking = false
        }

        setApiConfig(parsedConfig)
      }
    } catch (err) {
      console.error("Error loading chat data from local storage:", err)
    }
  }, [])

  // Save sessions to local storage when they change
  useEffect(() => {
    try {
      if (chatSessions.length > 0) {
        localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(chatSessions))
      } else {
        // If there are no sessions, clear the storage
        localStorage.removeItem(CHAT_SESSIONS_KEY)
      }
    } catch (err) {
      console.error("Error saving chat sessions to local storage:", err)
    }
  }, [chatSessions])

  // Save active session ID to local storage when it changes
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_ID_KEY, activeSessionId)
      } else {
        localStorage.removeItem(ACTIVE_SESSION_ID_KEY)
      }
    } catch (err) {
      console.error("Error saving active session ID to local storage:", err)
    }
  }, [activeSessionId])

  // Save API config to local storage when it changes
  useEffect(() => {
    try {
      if (apiConfig) {
        localStorage.setItem(API_CONFIG_KEY, JSON.stringify(apiConfig))
      } else {
        localStorage.removeItem(API_CONFIG_KEY)
      }
    } catch (err) {
      console.error("Error saving API config to local storage:", err)
    }
  }, [apiConfig])

  // Get the active session
  const activeSession = chatSessions.find((session) => session.id === activeSessionId) || null

  // Create a new chat session
  const createSession = useCallback(() => {
    const newSessionId = uuidv4()
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setChatSessions((prev) => [...prev, newSession])
    setActiveSessionId(newSessionId)
    return newSessionId
  }, [])

  // Delete a chat session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setChatSessions((prev) => prev.filter((session) => session.id !== sessionId))

      // If the deleted session was active, set a new active session
      if (sessionId === activeSessionId) {
        const remainingSessions = chatSessions.filter((session) => session.id !== sessionId)
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id)
        } else {
          setActiveSessionId(null)
        }
      }
    },
    [activeSessionId, chatSessions],
  )

  // Update session title based on first message
  const updateSessionTitle = useCallback((sessionId: string, message: string) => {
    setChatSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId && session.title === "New Chat") {
          // Create a title from the first few words of the message
          const title = message.split(" ").slice(0, 4).join(" ") + (message.split(" ").length > 4 ? "..." : "")
          return { ...session, title }
        }
        return session
      }),
    )
  }, [])

  // Add updateInstructions function to the hook
  const updateInstructions = useCallback(
    (instructions: string) => {
      if (!apiConfig) return

      setApiConfig((prev) => {
        if (!prev) return null
        return { ...prev, instructions }
      })
    },
    [apiConfig],
  )

  // Toggle thinking mode
  const toggleThinking = useCallback(() => {
    if (!apiConfig) return

    setApiConfig((prev) => {
      if (!prev) return null
      return { ...prev, enableThinking: !prev.enableThinking }
    })
  }, [apiConfig])

  // Set API provider, key, model, and endpoint
  const setApiProvider = useCallback(
    (
      provider: Provider,
      apiKey: string,
      model?: ModelType,
      endpoint?: string,
      instructions?: string,
      enableThinking?: boolean,
    ) => {
      // Set default model based on provider
      let defaultModel: ModelType

      switch (provider) {
        case "groq":
          defaultModel = DEFAULT_GROQ_MODEL
          break
        case "gemini":
          defaultModel = DEFAULT_GEMINI_MODEL
          break
        case "openai":
          defaultModel = DEFAULT_OPENAI_MODEL
          break
        case "grok":
          defaultModel = DEFAULT_GROK_MODEL
          break
        case "local":
          defaultModel = "local-model"
          break
        default:
          defaultModel = DEFAULT_GEMINI_MODEL
      }

      setApiConfig((prev) => {
        // Initialize or update provider keys
        const providerKeys = prev?.providerKeys || {
          gemini: "",
          groq: "",
          openai: "",
          grok: "",
          local: "",
        }

        // Update the key for the current provider
        providerKeys[provider] = apiKey

        return {
          provider,
          apiKey, // Current provider's API key
          providerKeys, // All provider keys
          model: model || defaultModel,
          endpoint: endpoint || undefined,
          instructions: instructions || undefined,
          enableThinking: enableThinking !== undefined ? enableThinking : false,
        }
      })
      // Note: API config is saved to localStorage via the useEffect above
    },
    [],
  )

  // Update just the model
  const updateModel = useCallback(
    (model: ModelType) => {
      if (!apiConfig) return

      setApiConfig((prev) => {
        if (!prev) return null
        return { ...prev, model }
      })
    },
    [apiConfig],
  )

  // Update just the endpoint (for local LLM)
  const updateEndpoint = useCallback(
    (endpoint: string) => {
      if (!apiConfig) return

      setApiConfig((prev) => {
        if (!prev) return null
        return { ...prev, endpoint }
      })
    },
    [apiConfig],
  )

  // Process AI response to extract thinking and answer parts
  const processAIResponse = (content: string): { thinking: string | null; answer: string } => {
    // Check if the response follows the thinking/answer format
    const thinkingMatch = content.match(/^Thinking:(.*?)Answer:(.*)/s)

    if (thinkingMatch) {
      const thinking = thinkingMatch[1].trim()
      const answer = thinkingMatch[2].trim()
      return { thinking, answer }
    }

    // If no match, return the whole content as the answer
    return { thinking: null, answer: content }
  }

  // Helper function to ensure endpoint has the correct path for LM Studio
  const ensureCompletionsEndpoint = (endpoint: string): string => {
    // Remove trailing slashes
    const cleanEndpoint = endpoint.trim().replace(/\/+$/, "")

    // Check if the endpoint already has the chat completions path
    if (cleanEndpoint.endsWith("/v1/chat/completions")) {
      return cleanEndpoint
    }

    // If it doesn't have the path, add it
    return `${cleanEndpoint}/v1/chat/completions`
  }

  // Send a message to the AI
  const sendMessage = useCallback(
    async (message: string) => {
      setError(null)

      // Create a session if none exists
      let sessionId = activeSessionId
      if (!sessionId) {
        sessionId = createSession()
      }

      // Check if API is configured
      const currentApiKey = apiConfig?.providerKeys?.[apiConfig.provider] || apiConfig?.apiKey
      if (!currentApiKey && apiConfig?.provider !== "local") {
        setError("API key not configured")
        return
      }

      if (apiConfig?.provider === "local" && !apiConfig?.endpoint) {
        setError("Local LLM endpoint not configured")
        return
      }

      // Add user message
      const userMessageId = uuidv4()
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: message,
        timestamp: Date.now(),
      }

      setChatSessions((prev) =>
        prev.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: [...session.messages, userMessage],
              updatedAt: Date.now(),
            }
          }
          return session
        }),
      )

      // Update session title if this is the first message
      const session = chatSessions.find((s) => s.id === sessionId)
      if (session && session.messages.length === 0) {
        updateSessionTitle(sessionId, message)
      }

      // Send to AI API
      setIsLoading(true)
      try {
        let response: Response
        let data: any
        let aiContent: string

        // Get previous messages for context (for providers that support it)
        // Limit to the last MAX_CONTEXT_MESSAGES messages
        const allMessages = session?.messages || []
        const visibleMessages = allMessages.filter((msg) => msg.isVisible !== false)
        const recentMessages = visibleMessages.slice(-MAX_CONTEXT_MESSAGES)

        const previousMessages = recentMessages.map((msg) => ({
          role: msg.role === "thinking" ? "assistant" : msg.role, // Convert thinking to assistant for API compatibility
          content: msg.content,
        }))

        // Prepare instructions with thinking prompt if enabled
        const baseInstructions = apiConfig.instructions || ""
        const finalInstructions = apiConfig.enableThinking
          ? `${baseInstructions}\n\n${THINKING_PROMPT}`
          : baseInstructions

        switch (apiConfig?.provider) {
          case "gemini":
            // Get the correct Gemini model
            const geminiModel = (apiConfig.model as GeminiModel) || DEFAULT_GEMINI_MODEL
            const geminiApiKey = apiConfig.providerKeys?.[apiConfig.provider] || apiConfig.apiKey

            // For Gemini, we need to handle system instructions differently
            // If we have instructions, prepend them to the user's message
            const geminiMessage = finalInstructions ? `[Instructions: ${finalInstructions}]\n\n${message}` : message

            // For Gemini, we need to format the conversation history differently
            const geminiHistory = previousMessages.map((msg) => ({
              role: msg.role === "system" ? "user" : msg.role,
              parts: [{ text: msg.role === "system" ? `[Instructions: ${msg.content}]` : msg.content }],
            }))

            // If we have history, use it
            const geminiRequest =
              geminiHistory.length > 0
                ? {
                    contents: [
                      ...geminiHistory,
                      {
                        role: "user",
                        parts: [{ text: message }],
                      },
                    ],
                    generationConfig: {
                      temperature: 0.7,
                      topK: 40,
                      topP: 0.95,
                      maxOutputTokens: 2048,
                    },
                  }
                : {
                    contents: [
                      {
                        parts: [{ text: geminiMessage }],
                      },
                    ],
                    generationConfig: {
                      temperature: 0.7,
                      topK: 40,
                      topP: 0.95,
                      maxOutputTokens: 2048,
                    },
                  }

            response = await fetch(
              `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateContent`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-goog-api-key": geminiApiKey,
                },
                body: JSON.stringify(geminiRequest),
              },
            )

            data = await response.json()

            if (!response.ok) {
              throw new Error(data.error?.message || "Failed to get response from Gemini")
            }

            aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."
            break

          case "groq":
            // Get the correct Groq model
            const groqModel = (apiConfig.model as GroqModel) || DEFAULT_GROQ_MODEL
            const groqApiKey = apiConfig.providerKeys?.[apiConfig.provider] || apiConfig.apiKey

            response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqApiKey}`,
              },
              body: JSON.stringify({
                model: groqModel,
                messages: [
                  ...(finalInstructions ? [{ role: "system", content: finalInstructions }] : []),
                  ...previousMessages,
                  { role: "user", content: message },
                ],
                temperature: 0.7,
                max_tokens: 2048,
              }),
            })

            data = await response.json()

            if (!response.ok) {
              throw new Error(data.error?.message || "Failed to get response from Groq")
            }

            aiContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."
            break

          case "openai":
            // Get the correct OpenAI model
            const openaiModel = (apiConfig.model as OpenAIModel) || DEFAULT_OPENAI_MODEL
            const openaiApiKey = apiConfig.providerKeys?.[apiConfig.provider] || apiConfig.apiKey

            response = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openaiApiKey}`,
              },
              body: JSON.stringify({
                model: openaiModel,
                messages: [
                  ...(finalInstructions ? [{ role: "system", content: finalInstructions }] : []),
                  ...previousMessages,
                  { role: "user", content: message },
                ],
                temperature: 0.7,
                max_tokens: 2048,
              }),
            })

            data = await response.json()

            if (!response.ok) {
              throw new Error(data.error?.message || "Failed to get response from OpenAI")
            }

            aiContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."
            break

          case "grok":
            // Get the correct Grok model
            const grokModel = (apiConfig.model as GrokModel) || DEFAULT_GROK_MODEL
            const grokApiKey = apiConfig.providerKeys?.[apiConfig.provider] || apiConfig.apiKey

            response = await fetch("https://api.xai.sx/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${grokApiKey}`,
              },
              body: JSON.stringify({
                model: grokModel,
                messages: [
                  ...(finalInstructions ? [{ role: "system", content: finalInstructions }] : []),
                  ...previousMessages,
                  { role: "user", content: message },
                ],
                temperature: 0.7,
                max_tokens: 2048,
              }),
            })

            data = await response.json()

            if (!response.ok) {
              throw new Error(data.error?.message || "Failed to get response from Grok")
            }

            aiContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."
            break

          case "local":
            // Use the provided endpoint for local LLM
            if (!apiConfig.endpoint) {
              throw new Error("Local LLM endpoint not configured")
            }

            // Ensure the endpoint has the correct path for completions
            const localEndpoint = ensureCompletionsEndpoint(apiConfig.endpoint)

            console.log("Using local LLM endpoint:", localEndpoint)

            try {
              // Format messages for LM Studio (OpenAI compatible format)
              const formattedMessages = [
                ...(finalInstructions ? [{ role: "system", content: finalInstructions }] : []),
                ...previousMessages,
                { role: "user", content: message },
              ]

              console.log("Sending request to local LLM with messages:", formattedMessages)

              response = await fetch(localEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "local-model", // LM Studio ignores this but requires it
                  messages: formattedMessages,
                  temperature: 0.7,
                  max_tokens: 2048,
                  stream: false, // Important: set to false for non-streaming response
                }),
              })

              if (!response.ok) {
                const errorText = await response.text()
                console.error("Local LLM error response:", errorText)
                throw new Error(`Failed to get response from local LLM: ${response.status} ${response.statusText}`)
              }

              data = await response.json()
              console.log("Local LLM response:", data)

              if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error("Invalid response format from local LLM")
              }

              aiContent = data.choices[0].message.content || "Sorry, I couldn't generate a response."
            } catch (err) {
              console.error("Error communicating with local LLM:", err)
              throw new Error(`Failed to communicate with local LLM: ${err.message || "Unknown error"}`)
            }
            break

          default:
            throw new Error("Unknown provider")
        }

        // Process the AI response to extract thinking and answer parts if thinking is enabled
        if (apiConfig.enableThinking) {
          const { thinking, answer } = processAIResponse(aiContent)

          // If thinking was extracted, add it as a separate message
          if (thinking) {
            const thinkingMessageId = uuidv4()
            const thinkingMessage: ChatMessage = {
              id: thinkingMessageId,
              role: "thinking",
              content: thinking,
              timestamp: Date.now(),
              isVisible: true, // Make thinking visible to the user
            }

            // Add the thinking message
            setChatSessions((prev) =>
              prev.map((session) => {
                if (session.id === sessionId) {
                  return {
                    ...session,
                    messages: [...session.messages, thinkingMessage],
                    updatedAt: Date.now(),
                  }
                }
                return session
              }),
            )

            // Add the answer as a separate message
            const answerMessageId = uuidv4()
            const answerMessage: ChatMessage = {
              id: answerMessageId,
              role: "assistant",
              content: answer,
              timestamp: Date.now() + 1, // Add 1ms to ensure correct ordering
            }

            setChatSessions((prev) =>
              prev.map((session) => {
                if (session.id === sessionId) {
                  return {
                    ...session,
                    messages: [...session.messages, answerMessage],
                    updatedAt: Date.now(),
                  }
                }
                return session
              }),
            )
          } else {
            // If no thinking was extracted, just add the whole response as an assistant message
            const aiMessageId = uuidv4()
            const aiMessage: ChatMessage = {
              id: aiMessageId,
              role: "assistant",
              content: aiContent,
              timestamp: Date.now(),
            }

            setChatSessions((prev) =>
              prev.map((session) => {
                if (session.id === sessionId) {
                  return {
                    ...session,
                    messages: [...session.messages, aiMessage],
                    updatedAt: Date.now(),
                  }
                }
                return session
              }),
            )
          }
        } else {
          // If thinking is not enabled, just add the response as an assistant message
          const aiMessageId = uuidv4()
          const aiMessage: ChatMessage = {
            id: aiMessageId,
            role: "assistant",
            content: aiContent,
            timestamp: Date.now(),
          }

          setChatSessions((prev) =>
            prev.map((session) => {
              if (session.id === sessionId) {
                return {
                  ...session,
                  messages: [...session.messages, aiMessage],
                  updatedAt: Date.now(),
                }
              }
              return session
            }),
          )
        }
      } catch (err: any) {
        setError(err.message || "Failed to communicate with AI service")
        console.error("AI API error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [activeSessionId, apiConfig, chatSessions, createSession, updateSessionTitle],
  )

  // Export current chat data (for backup purposes)
  const exportChatData = useCallback(() => {
    try {
      const data = {
        sessions: chatSessions,
        activeSessionId,
        apiConfig: apiConfig ? { ...apiConfig, apiKey: "[REDACTED]" } : null, // Don't export API key
      }
      return JSON.stringify(data, null, 2)
    } catch (err) {
      console.error("Error exporting chat data:", err)
      return null
    }
  }, [chatSessions, activeSessionId, apiConfig])

  // Add updateInstructions to the return object at the end of the hook
  return {
    chatSessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    sendMessage,
    isLoading,
    error,
    apiConfig,
    setApiProvider,
    updateModel,
    updateEndpoint,
    updateInstructions,
    toggleThinking,
    exportChatData,
  }
}
