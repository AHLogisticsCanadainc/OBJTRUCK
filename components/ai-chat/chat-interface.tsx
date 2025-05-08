"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { useAiChat } from "@/hooks/use-ai-chat"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChatMessage } from "./chat-message"
import { ChatSessionList } from "./chat-session-list"
import { ModelSwitcher } from "./model-switcher"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  AlertCircle,
  Bot,
  Settings,
  MessageSquare,
  PlusCircle,
  Menu,
  Key,
  Globe,
  Server,
  Zap,
  BrainCircuit,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MODEL_DISPLAY_NAMES } from "@/hooks/use-ai-chat"
import { ApiConfigSection } from "./api-config-section"
import { ThinkingToggle } from "./thinking-toggle"

export function ChatInterface() {
  const {
    apiConfig,
    setApiProvider,
    updateModel,
    updateInstructions,
    toggleThinking,
    chatSessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    sendMessage,
    isLoading,
    error,
  } = useAiChat()

  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("chat")

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeSession?.messages])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim())
      setInputValue("")

      // Focus back on textarea
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  // Handle textarea key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Switch to settings tab
  const goToSettings = () => {
    setActiveTab("settings")
    const settingsTab = document.querySelector('[data-value="settings"]') as HTMLElement
    if (settingsTab) {
      settingsTab.click()
    }
  }

  // Render the mobile sidebar
  const renderMobileSidebar = () => (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px]">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Sessions
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatSessionList
              sessions={chatSessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => {
                setActiveSessionId(id)
                setSidebarOpen(false)
              }}
              onCreateSession={() => {
                createSession()
                setSidebarOpen(false)
              }}
              onDeleteSession={deleteSession}
              onOpenSettings={() => {
                goToSettings()
                setSidebarOpen(false)
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Render the empty state when no API key is configured
  const renderNoApiKeyState = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium">Configure AI Provider</h3>
          <p className="text-muted-foreground">
            Please configure your AI provider in the Settings tab to start chatting with the AI assistant.
          </p>
          <Button variant="default" onClick={goToSettings} className="mt-2">
            <Settings className="mr-2 h-4 w-4" />
            Go to Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Render the empty state when no messages exist
  const renderEmptyChatState = () => (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium">Start a conversation</h3>
        <p className="text-muted-foreground">Ask a question or start a conversation with the AI assistant.</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            className="text-left justify-start h-auto py-3"
            onClick={() => setInputValue("What are the best practices for trucking insurance?")}
          >
            <div>
              <p className="font-medium">Insurance best practices</p>
              <p className="text-xs text-muted-foreground">For trucking companies</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="text-left justify-start h-auto py-3"
            onClick={() => setInputValue("Explain cargo insurance requirements")}
          >
            <div>
              <p className="font-medium">Cargo insurance</p>
              <p className="text-xs text-muted-foreground">Requirements and coverage</p>
            </div>
          </Button>
        </div>

        {/* Add settings button in empty state */}
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={goToSettings} className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {apiConfig
              ? apiConfig.instructions
                ? "Edit AI Instructions"
                : "Configure AI Instructions"
              : "Configure AI Provider"}
          </Button>
        </div>
      </div>
    </div>
  )

  // Get current model display name
  const currentModelName = apiConfig?.model ? MODEL_DISPLAY_NAMES[apiConfig.model] || "Custom Model" : "Model"

  // Get provider icon
  const getProviderIcon = () => {
    if (!apiConfig) return <Bot className="h-3 w-3" />

    switch (apiConfig.provider) {
      case "gemini":
        return <Bot className="h-3 w-3" />
      case "groq":
        return <Bot className="h-3 w-3" />
      case "openai":
        return <Globe className="h-3 w-3" />
      case "grok":
        return <Zap className="h-3 w-3" />
      case "local":
        return <Server className="h-3 w-3" />
      default:
        return <Bot className="h-3 w-3" />
    }
  }

  // Get provider display name
  const getProviderDisplayName = () => {
    if (!apiConfig) return "AI"

    switch (apiConfig.provider) {
      case "gemini":
        return "Gemini"
      case "groq":
        return "Groq"
      case "openai":
        return "OpenAI"
      case "grok":
        return "Grok"
      case "local":
        return "Local LLM"
      default:
        return "AI"
    }
  }

  // Check if API is configured
  const isApiConfigured = () => {
    if (!apiConfig) return false

    if (apiConfig.provider === "local") {
      return !!apiConfig.endpoint
    } else {
      return !!apiConfig.apiKey
    }
  }

  // Get thinking mode status
  const getThinkingStatus = () => {
    return apiConfig?.enableThinking ? (
      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
        <BrainCircuit className="h-3 w-3" />
        <span>Thinking Mode On</span>
      </div>
    ) : null
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar with chat sessions - desktop only */}
      <div className="w-64 border-r hidden md:block">
        <ChatSessionList
          sessions={chatSessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onCreateSession={createSession}
          onDeleteSession={deleteSession}
          onOpenSettings={goToSettings}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderMobileSidebar()}
              <TabsList>
                <TabsTrigger value="chat" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2">
              {/* Model switcher - only visible for providers with multiple models */}
              {apiConfig && apiConfig.provider !== "local" && (
                <ModelSwitcher apiConfig={apiConfig} onModelChange={updateModel} disabled={isLoading} />
              )}

              {/* Settings button - always visible */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={goToSettings} className="h-8 w-8">
                      <Key className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* New chat button - only when in a session */}
              {activeSession && (
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={createSession}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col h-full p-0 m-0">
            {!isApiConfigured() ? (
              renderNoApiKeyState()
            ) : (
              <>
                {/* Messages area */}
                <ScrollArea className="flex-1">
                  <div className="divide-y">
                    {!activeSession || activeSession.messages.length === 0
                      ? renderEmptyChatState()
                      : activeSession.messages.map((message) => <ChatMessage key={message.id} message={message} />)}
                    {isLoading && (
                      <div className="flex items-center p-4 bg-background">
                        <LoadingSpinner size="sm" />
                        <span className="ml-3 text-sm">AI is thinking...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input area */}
                <div className="border-t p-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error.includes("API key") ? (
                          <>
                            API key error. Please check that your {getProviderDisplayName()} API key is valid.
                            <Button variant="link" className="p-0 h-auto ml-1" onClick={goToSettings}>
                              Update settings
                            </Button>
                          </>
                        ) : error.includes("endpoint") ? (
                          <>
                            Endpoint error. Please check your local LLM endpoint URL.
                            <Button variant="link" className="p-0 h-auto ml-1" onClick={goToSettings}>
                              Update endpoint
                            </Button>
                          </>
                        ) : (
                          error
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="min-h-[60px] flex-1 resize-none"
                      disabled={isLoading || !isApiConfigured()}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputValue.trim() || isLoading || !isApiConfigured()}
                      className="h-[60px] w-[60px] rounded-md"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
                      {getThinkingStatus()}
                    </div>

                    {/* Provider and model info in the input area */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToSettings}
                      className="h-6 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {getProviderIcon()}
                      {getProviderDisplayName()}
                      {apiConfig?.provider !== "local" && `: ${currentModelName}`}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings" className="p-4 m-0 overflow-auto">
            <div className="space-y-6 max-w-3xl mx-auto">
              <ApiConfigSection />

              {/* Add the thinking toggle */}
              {apiConfig && <ThinkingToggle apiConfig={apiConfig} onToggle={toggleThinking} />}

              {/* Add a button to go back to chat after saving settings */}
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setActiveTab("chat")} className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Return to Chat
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
