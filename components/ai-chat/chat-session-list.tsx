"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Trash2, MessageSquare, MoreVertical, Settings, Key } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { ChatSession } from "@/hooks/use-ai-chat"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ChatSessionListProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  onOpenSettings?: () => void
}

export function ChatSessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onOpenSettings,
}: ChatSessionListProps) {
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null)

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteSession(sessionId)
  }

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat Sessions
        </h2>
        <div className="flex gap-1">
          {onOpenSettings && (
            <Button variant="ghost" size="icon" onClick={onOpenSettings} className="h-8 w-8">
              <Key className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onCreateSession} className="h-8 w-8">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No chat sessions yet</p>
              <Button variant="link" onClick={onCreateSession} className="mt-2">
                Create your first chat
              </Button>
            </div>
          ) : (
            sortedSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 group",
                  activeSessionId === session.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground hover:text-foreground",
                )}
                onClick={() => onSelectSession(session.id)}
                onMouseEnter={() => setHoveredSessionId(session.id)}
                onMouseLeave={() => setHoveredSessionId(null)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <MessageSquare
                      className={cn(
                        "h-4 w-4 mr-2 flex-shrink-0",
                        activeSessionId === session.id ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <p className="text-sm font-medium truncate">{session.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                  </p>
                </div>

                <div
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    hoveredSessionId === session.id && "opacity-100",
                  )}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleDeleteSession(session.id, e)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      {onOpenSettings && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenSettings()
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          API Settings
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button onClick={onCreateSession} className="w-full flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
        {onOpenSettings && (
          <Button
            variant="outline"
            onClick={onOpenSettings}
            className="w-full mt-2 flex items-center gap-2"
            onClick={onOpenSettings}
            className="w-full mt-2 flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            API Settings
          </Button>
        )}
      </div>
    </div>
  )
}
