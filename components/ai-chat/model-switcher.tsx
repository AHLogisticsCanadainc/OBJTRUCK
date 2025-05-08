"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { type ApiConfig, type ModelType, MODEL_DISPLAY_NAMES } from "@/hooks/use-ai-chat"

interface ModelSwitcherProps {
  apiConfig: ApiConfig | null
  onModelChange: (model: ModelType) => void
  disabled?: boolean
}

export function ModelSwitcher({ apiConfig, onModelChange, disabled = false }: ModelSwitcherProps) {
  const [open, setOpen] = useState(false)

  if (!apiConfig) return null

  // Get current model display name
  const currentModelName = apiConfig.model ? MODEL_DISPLAY_NAMES[apiConfig.model] || apiConfig.model : "Select Model"

  // Define available models based on provider
  const getAvailableModels = () => {
    switch (apiConfig.provider) {
      case "groq":
        return [
          { id: "llama3-8b-8192", name: MODEL_DISPLAY_NAMES["llama3-8b-8192"] },
          { id: "llama3-70b-8192", name: MODEL_DISPLAY_NAMES["llama3-70b-8192"] },
          { id: "mixtral-8x7b-32768", name: MODEL_DISPLAY_NAMES["mixtral-8x7b-32768"] },
        ]
      case "gemini":
        return [
          { id: "gemini-2.0-flash", name: MODEL_DISPLAY_NAMES["gemini-2.0-flash"] },
          { id: "gemini-2.0-pro", name: MODEL_DISPLAY_NAMES["gemini-2.0-pro"] },
        ]
      case "openai":
        return [
          { id: "gpt-3.5-turbo", name: MODEL_DISPLAY_NAMES["gpt-3.5-turbo"] },
          { id: "gpt-4", name: MODEL_DISPLAY_NAMES["gpt-4"] },
          { id: "gpt-4-turbo", name: MODEL_DISPLAY_NAMES["gpt-4-turbo"] },
          { id: "gpt-4o", name: MODEL_DISPLAY_NAMES["gpt-4o"] },
        ]
      case "grok":
        return [
          { id: "grok-1", name: MODEL_DISPLAY_NAMES["grok-1"] },
          { id: "grok-1.5-mini", name: MODEL_DISPLAY_NAMES["grok-1.5-mini"] },
          { id: "grok-1.5", name: MODEL_DISPLAY_NAMES["grok-1.5"] },
        ]
      case "local":
        // Local LLM doesn't have model selection
        return []
      default:
        return []
    }
  }

  const models = getAvailableModels()

  // If there are no models to switch between, don't render the component
  if (models.length <= 1) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          <span className="hidden sm:inline">{currentModelName}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Select Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => {
                onModelChange(model.id as ModelType)
                setOpen(false)
              }}
              className={apiConfig.model === model.id ? "bg-accent" : ""}
            >
              {model.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
