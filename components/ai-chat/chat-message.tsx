"use client"

import type { ChatMessage as ChatMessageType } from "@/hooks/use-ai-chat"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Bot, User, BrainCircuit } from "lucide-react"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isThinking = message.role === "thinking"
  const formattedTime = format(new Date(message.timestamp), "h:mm a")

  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser ? "bg-muted/50" : "bg-background",
        isThinking && "bg-blue-50 dark:bg-blue-950/20",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm",
          isUser ? "bg-background" : "bg-primary text-primary-foreground",
          isThinking && "bg-blue-500 text-white dark:bg-blue-600",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isThinking ? (
          <BrainCircuit className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{isUser ? "You" : isThinking ? "AI Thinking" : "AI Assistant"}</div>
          <div className="text-xs text-muted-foreground">{formattedTime}</div>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isThinking ? (
            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Thinking Process:</h4>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
      </div>
    </div>
  )
}
