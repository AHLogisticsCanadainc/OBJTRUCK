"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type ApiConfig,
  type GroqModel,
  type GeminiModel,
  type OpenAIModel,
  type GrokModel,
  type Provider,
  MODEL_DISPLAY_NAMES,
} from "@/hooks/use-ai-chat"
import { AlertCircle, CheckCircle2, Key, Bot, Globe, Server, Zap, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { validateApiKey } from "@/utils/api-validation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomInstructions } from "./custom-instructions"
import { LMStudioTroubleshooter } from "./lm-studio-troubleshooter"

interface ApiKeyConfigProps {
  apiConfig: ApiConfig | null
  onSave: (
    provider: Provider,
    apiKey: string,
    model: GroqModel | GeminiModel | OpenAIModel | GrokModel | string,
    endpoint?: string,
    instructions?: string,
  ) => void
}

export function ApiKeyConfig({ apiConfig, onSave }: ApiKeyConfigProps) {
  const [provider, setProvider] = useState<Provider>(apiConfig?.provider || "gemini")
  const [apiKey, setApiKey] = useState(apiConfig?.providerKeys?.[provider] || apiConfig?.apiKey || "")
  const [endpoint, setEndpoint] = useState(apiConfig?.endpoint || "")
  const [instructions, setInstructions] = useState(apiConfig?.instructions || "")
  const [showSuccess, setShowSuccess] = useState(false)

  // Model selection
  const [geminiModel, setGeminiModel] = useState<GeminiModel>(
    (apiConfig?.provider === "gemini" && (apiConfig?.model as GeminiModel)) || "gemini-2.0-flash",
  )
  const [groqModel, setGroqModel] = useState<GroqModel>(
    (apiConfig?.provider === "groq" && (apiConfig?.model as GroqModel)) || "llama3-8b-8192",
  )
  const [openaiModel, setOpenaiModel] = useState<OpenAIModel>(
    (apiConfig?.provider === "openai" && (apiConfig?.model as OpenAIModel)) || "gpt-3.5-turbo",
  )
  const [grokModel, setGrokModel] = useState<GrokModel>(
    (apiConfig?.provider === "grok" && (apiConfig?.model as GrokModel)) || "grok-1.5",
  )

  // Update model selections when apiConfig changes
  useEffect(() => {
    if (apiConfig) {
      if (apiConfig.provider === "gemini") {
        setGeminiModel(apiConfig.model as GeminiModel)
      } else if (apiConfig.provider === "groq") {
        setGroqModel(apiConfig.model as GroqModel)
      } else if (apiConfig.provider === "openai") {
        setOpenaiModel(apiConfig.model as OpenAIModel)
      } else if (apiConfig.provider === "grok") {
        setGrokModel(apiConfig.model as GrokModel)
      } else if (apiConfig.provider === "local") {
        setEndpoint(apiConfig.endpoint || "")
      }
    }
  }, [apiConfig])

  // Add this useEffect to update the API key when switching providers
  useEffect(() => {
    if (apiConfig?.providerKeys) {
      setApiKey(apiConfig.providerKeys[provider] || "")
    } else if (apiConfig?.provider === provider) {
      setApiKey(apiConfig.apiKey || "")
    } else {
      setApiKey("")
    }
  }, [provider, apiConfig])

  const handleSave = () => {
    // For local LLM, we need an endpoint but not an API key
    if (provider === "local") {
      if (!endpoint.trim()) {
        return
      }
      onSave(provider, "", "local-model", endpoint.trim(), instructions)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      return
    }

    // For other providers, we need an API key
    if (apiKey.trim()) {
      // Note: We're not strictly enforcing validation to allow for API key format changes
      // Just showing a warning if the format doesn't match expected patterns
      if (provider !== "local" && !validateApiKey(provider, apiKey.trim())) {
        console.warn("API key format may not be valid, but proceeding with save")
      }

      // Use the appropriate model based on provider
      let model: GroqModel | GeminiModel | OpenAIModel | GrokModel | string
      switch (provider) {
        case "gemini":
          model = geminiModel
          break
        case "groq":
          model = groqModel
          break
        case "openai":
          model = openaiModel
          break
        case "grok":
          model = grokModel
          break
        default:
          model = "local-model"
      }

      onSave(provider, apiKey.trim(), model, provider === "local" ? endpoint.trim() : undefined, instructions)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Configuration
        </CardTitle>
        <CardDescription>Configure your AI provider to start chatting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue={provider} onValueChange={(value) => setProvider(value as Provider)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
            <TabsTrigger value="groq">Groq</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="grok">Grok</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
          </TabsList>

          {/* Gemini Tab Content */}
          <TabsContent value="gemini" className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300">Google Gemini</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Using Gemini models for fast, efficient text generation.
                </p>
                <a
                  href="https://ai.google.dev/tutorials/setup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                >
                  Get API key from Google AI Studio →
                </a>
              </div>
            </div>

            {/* Gemini Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="gemini-model">Model</Label>
              <Select value={geminiModel} onValueChange={(value) => setGeminiModel(value as GeminiModel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.0-flash">
                    {MODEL_DISPLAY_NAMES["gemini-2.0-flash"]} - Fast responses
                  </SelectItem>
                  <SelectItem value="gemini-2.0-pro">
                    {MODEL_DISPLAY_NAMES["gemini-2.0-pro"]} - Higher quality
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select the Gemini model you want to use for chat responses.
              </p>
            </div>
          </TabsContent>

          {/* Groq Tab Content */}
          <TabsContent value="groq" className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1" />
              <div>
                <h3 className="font-medium text-purple-800 dark:text-purple-300">Groq</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Groq offers ultra-fast inference for LLMs with minimal latency.
                </p>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block"
                >
                  Get API key from Groq Console →
                </a>
              </div>
            </div>

            {/* Groq Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="groq-model">Model</Label>
              <Select value={groqModel} onValueChange={(value) => setGroqModel(value as GroqModel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama3-8b-8192">
                    {MODEL_DISPLAY_NAMES["llama3-8b-8192"]} - Fast, efficient
                  </SelectItem>
                  <SelectItem value="llama3-70b-8192">
                    {MODEL_DISPLAY_NAMES["llama3-70b-8192"]} - Most capable
                  </SelectItem>
                  <SelectItem value="mixtral-8x7b-32768">
                    {MODEL_DISPLAY_NAMES["mixtral-8x7b-32768"]} - Balanced performance
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select the Groq model you want to use for chat responses.
              </p>
            </div>
          </TabsContent>

          {/* OpenAI Tab Content */}
          <TabsContent value="openai" className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <Globe className="h-6 w-6 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300">OpenAI</h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Access OpenAI's powerful language models like GPT-3.5 and GPT-4.
                </p>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2 inline-block"
                >
                  Get API key from OpenAI Platform →
                </a>
              </div>
            </div>

            {/* OpenAI Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="openai-model">Model</Label>
              <Select value={openaiModel} onValueChange={(value) => setOpenaiModel(value as OpenAIModel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">
                    {MODEL_DISPLAY_NAMES["gpt-3.5-turbo"]} - Fast & affordable
                  </SelectItem>
                  <SelectItem value="gpt-4">{MODEL_DISPLAY_NAMES["gpt-4"]} - Advanced capabilities</SelectItem>
                  <SelectItem value="gpt-4-turbo">
                    {MODEL_DISPLAY_NAMES["gpt-4-turbo"]} - Improved performance
                  </SelectItem>
                  <SelectItem value="gpt-4o">{MODEL_DISPLAY_NAMES["gpt-4o"]} - Latest model</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select the OpenAI model you want to use for chat responses.
              </p>
            </div>
          </TabsContent>

          {/* Grok Tab Content */}
          <TabsContent value="grok" className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-pink-50 dark:bg-pink-950/30">
              <Zap className="h-6 w-6 text-pink-600 dark:text-pink-400 mt-1" />
              <div>
                <h3 className="font-medium text-pink-800 dark:text-pink-300">Grok (xAI)</h3>
                <p className="text-sm text-pink-700 dark:text-pink-400">
                  Grok is a next-generation AI assistant designed to be helpful, harmless, and honest.
                </p>
                <a
                  href="https://x.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pink-600 dark:text-pink-400 hover:underline mt-2 inline-block"
                >
                  Learn more about Grok →
                </a>
              </div>
            </div>

            {/* Grok Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="grok-model">Model</Label>
              <Select value={grokModel} onValueChange={(value) => setGrokModel(value as GrokModel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grok-1">{MODEL_DISPLAY_NAMES["grok-1"]} - Original model</SelectItem>
                  <SelectItem value="grok-1.5-mini">
                    {MODEL_DISPLAY_NAMES["grok-1.5-mini"]} - Efficient version
                  </SelectItem>
                  <SelectItem value="grok-1.5">{MODEL_DISPLAY_NAMES["grok-1.5"]} - Latest model</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select the Grok model you want to use for chat responses.
              </p>
            </div>
          </TabsContent>

          {/* Local LLM Tab Content */}
          <TabsContent value="local" className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Server className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300">LM Studio</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Connect to a locally hosted LLM via LM Studio's OpenAI-compatible API.
                </p>
              </div>
            </div>

            {/* Local LLM Setup Instructions */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                <p className="font-medium mb-1">LM Studio Setup:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Download and install LM Studio from{" "}
                    <a href="https://lmstudio.ai/" target="_blank" rel="noopener noreferrer" className="underline">
                      lmstudio.ai
                    </a>
                  </li>
                  <li>Load a model in LM Studio</li>
                  <li>Click "Start Server" in the Local Server tab</li>
                  <li>Copy the server URL (usually http://localhost:1234)</li>
                  <li>Paste the URL below (our app will add the /v1/chat/completions path)</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Local LLM Endpoint Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="local-endpoint">Server URL</Label>
                {endpoint && <LMStudioTroubleshooter endpoint={endpoint} />}
              </div>
              <Input
                id="local-endpoint"
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="http://localhost:1234"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the base URL of your LM Studio server (e.g., http://localhost:1234). The /v1/chat/completions path
                will be added automatically.
              </p>
            </div>

            {/* Add a connection test button */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!endpoint.trim()}
                onClick={async () => {
                  try {
                    const testEndpoint = `${endpoint.trim().replace(/\/+$/, "")}/v1/models`
                    setShowSuccess(false)

                    const response = await fetch(testEndpoint)
                    if (!response.ok) {
                      throw new Error(`Failed to connect: ${response.status} ${response.statusText}`)
                    }

                    const data = await response.json()
                    if (data && data.data) {
                      alert(`Connection successful! Found ${data.data.length} models.`)
                    } else {
                      alert("Connection successful, but couldn't retrieve models list.")
                    }
                  } catch (err) {
                    alert(`Connection failed: ${err.message || "Unknown error"}`)
                  }
                }}
              >
                Test Connection
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* API Key Input (not shown for local LLM) */}
        {provider !== "local" && (
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${
                provider === "gemini"
                  ? "Google Gemini"
                  : provider === "groq"
                    ? "Groq"
                    : provider === "openai"
                      ? "OpenAI"
                      : "Grok"
              } API key`}
              className="font-mono"
            />
          </div>
        )}

        {showSuccess && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {provider === "local" ? "Endpoint" : "API key and model settings"} saved successfully
            </AlertDescription>
          </Alert>
        )}
        <div className="pt-4 border-t">
          <CustomInstructions
            apiConfig={apiConfig}
            onSave={(newInstructions) => {
              setInstructions(newInstructions)
              // If we already have a valid configuration, save immediately
              if ((provider !== "local" && apiKey.trim()) || (provider === "local" && endpoint.trim())) {
                handleSave()
              }
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          onClick={handleSave}
          disabled={(provider !== "local" && !apiKey.trim()) || (provider === "local" && !endpoint.trim())}
          className="w-full"
        >
          Save Settings
        </Button>

        <Alert variant="outline" className="bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {provider === "local"
              ? "Your endpoint URL is stored locally in your browser."
              : "Your API key is stored locally in your browser and never sent to our servers."}
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  )
}
