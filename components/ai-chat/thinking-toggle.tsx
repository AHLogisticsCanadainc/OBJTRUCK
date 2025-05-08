"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainCircuit } from "lucide-react"
import type { ApiConfig } from "@/hooks/use-ai-chat"

interface ThinkingToggleProps {
  apiConfig: ApiConfig | null
  onToggle: () => void
}

export function ThinkingToggle({ apiConfig, onToggle }: ThinkingToggleProps) {
  const isEnabled = apiConfig?.enableThinking || false

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5" />
          AI Thinking Mode
        </CardTitle>
        <CardDescription>
          Enable thinking mode to see the AI's step-by-step reasoning process before it provides an answer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="thinking-mode" className="flex flex-col space-y-1">
            <span>Enable Thinking Mode</span>
            <span className="font-normal text-xs text-muted-foreground">
              {isEnabled ? "AI will show its reasoning process" : "AI will only show final answers"}
            </span>
          </Label>
          <Switch id="thinking-mode" checked={isEnabled} onCheckedChange={onToggle} />
        </div>
      </CardContent>
    </Card>
  )
}
