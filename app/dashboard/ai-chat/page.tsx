"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Settings, Save } from "lucide-react"
import { ChatInterface } from "@/components/ai-chat/chat-interface"
import { ApiKeyConfig } from "@/components/ai-chat/api-key-config"
import { ApiKeyManager } from "@/components/ai-chat/api-key-manager"
import { useAiChat, type Provider, type ModelType } from "@/hooks/use-ai-chat"

export default function AIChatPage() {
  const {
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
  } = useAiChat()

  const [activeTab, setActiveTab] = useState<string>("chat")

  const handleApiConfigSave = (
    provider: Provider,
    apiKey: string,
    model: ModelType,
    endpoint?: string,
    instructions?: string,
  ) => {
    setApiProvider(provider, apiKey, model, endpoint, instructions)
    // Switch back to chat tab after saving
    setActiveTab("chat")
  }

  const handleApiConfigImport = (importedConfig: any) => {
    setApiProvider(
      importedConfig.provider,
      importedConfig.apiKey,
      importedConfig.model,
      importedConfig.endpoint,
      importedConfig.instructions,
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Chat with an AI assistant to get help with trucking and logistics questions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>API Settings</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Backup & Restore</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          {!apiConfig?.apiKey && apiConfig?.provider !== "local" ? (
            <Card>
              <CardHeader>
                <CardTitle>API Key Required</CardTitle>
                <CardDescription>Please configure your API key in the settings tab to start chatting</CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Go to Settings
                </button>
              </CardContent>
            </Card>
          ) : apiConfig?.provider === "local" && !apiConfig.endpoint ? (
            <Card>
              <CardHeader>
                <CardTitle>Local LLM Endpoint Required</CardTitle>
                <CardDescription>
                  Please configure your local LLM endpoint in the settings tab to start chatting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Go to Settings
                </button>
              </CardContent>
            </Card>
          ) : (
            <ChatInterface
              sessions={chatSessions}
              activeSession={activeSession}
              activeSessionId={activeSessionId}
              onSessionSelect={setActiveSessionId}
              onSessionCreate={createSession}
              onSessionDelete={deleteSession}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              error={error}
              apiConfig={apiConfig}
              onModelChange={updateModel}
            />
          )}
        </TabsContent>

        <TabsContent value="settings">
          <ApiKeyConfig apiConfig={apiConfig} onSave={handleApiConfigSave} />
        </TabsContent>

        <TabsContent value="backup">
          <ApiKeyManager apiConfig={apiConfig} onImport={handleApiConfigImport} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
