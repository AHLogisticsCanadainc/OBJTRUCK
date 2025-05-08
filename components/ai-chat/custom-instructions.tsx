"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ApiConfig } from "@/hooks/use-ai-chat"

interface CustomInstructionsProps {
  apiConfig: ApiConfig | null
  onSave: (instructions: string) => void
}

export function CustomInstructions({ apiConfig, onSave }: CustomInstructionsProps) {
  const [instructions, setInstructions] = useState(apiConfig?.instructions || "")
  const [showSuccess, setShowSuccess] = useState(false)

  // Update instructions when apiConfig changes
  useEffect(() => {
    if (apiConfig?.instructions !== undefined) {
      setInstructions(apiConfig.instructions)
    }
  }, [apiConfig])

  const handleSave = () => {
    onSave(instructions)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Instructions
        </CardTitle>
        <CardDescription>
          Paste your custom instructions for the AI to follow when responding to your questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Paste your custom instructions here..."
            className="min-h-[200px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            These instructions will be sent with each message to guide the AI's responses.
          </p>
        </div>

        {showSuccess && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Instructions saved successfully
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full">
          Save Instructions
        </Button>
      </CardFooter>
    </Card>
  )
}
