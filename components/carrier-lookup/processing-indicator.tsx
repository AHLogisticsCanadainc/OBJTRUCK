"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { X } from "lucide-react"

interface ProcessingIndicatorProps {
  currentCount: number
  totalCount: number
  onCancel: () => void
}

export function ProcessingIndicator({ currentCount, totalCount, onCancel }: ProcessingIndicatorProps) {
  const progress = totalCount > 0 ? Math.round((currentCount / totalCount) * 100) : 0

  // Calculate estimated time remaining (very simple calculation)
  const getStatusText = () => {
    if (currentCount === 0) return "Starting..."
    if (currentCount === totalCount) return "Completing..."
    return `${currentCount} of ${totalCount} carriers (${progress}%)`
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-card shadow-lg rounded-lg p-3 border border-border flex items-center gap-3 max-w-xs animate-in fade-in slide-in-from-left-5 duration-300">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="font-medium text-sm">Processing Carriers</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{getStatusText()}</div>
        <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onCancel}
        className="h-8 px-2 shrink-0"
        title="Stop Processing"
        aria-label="Stop carrier processing"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
