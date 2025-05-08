"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface LMStudioTroubleshooterProps {
  endpoint: string
}

export function LMStudioTroubleshooter({ endpoint }: LMStudioTroubleshooterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testResults, setTestResults] = useState<{
    baseConnection: boolean
    modelsEndpoint: boolean
    chatEndpoint: boolean
    error?: string
  } | null>(null)

  const runTests = async () => {
    setTestResults(null)
    const results = {
      baseConnection: false,
      modelsEndpoint: false,
      chatEndpoint: false,
    }

    try {
      // Clean the endpoint
      const baseEndpoint = endpoint.trim().replace(/\/+$/, "")

      // Test 1: Basic connection
      try {
        const response = await fetch(baseEndpoint)
        results.baseConnection = response.ok
      } catch (err) {
        results.baseConnection = false
      }

      // Test 2: Models endpoint
      try {
        const modelsResponse = await fetch(`${baseEndpoint}/v1/models`)
        results.modelsEndpoint = modelsResponse.ok
      } catch (err) {
        results.modelsEndpoint = false
      }

      // Test 3: Chat completions endpoint
      try {
        const chatResponse = await fetch(`${baseEndpoint}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "local-model",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 10,
          }),
        })
        results.chatEndpoint = chatResponse.ok
      } catch (err) {
        results.chatEndpoint = false
      }

      setTestResults(results)
    } catch (err) {
      setTestResults({
        baseConnection: false,
        modelsEndpoint: false,
        chatEndpoint: false,
        error: err.message || "Unknown error occurred during testing",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <HelpCircle className="h-4 w-4 mr-1" />
          Troubleshoot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>LM Studio Connection Troubleshooter</DialogTitle>
          <DialogDescription>Run tests to diagnose connection issues with your LM Studio server</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Testing endpoint: {endpoint || "Not set"}</span>
            <Button onClick={runTests} disabled={!endpoint} size="sm">
              Run Tests
            </Button>
          </div>

          {testResults && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                {testResults.baseConnection ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Base connection: {testResults.baseConnection ? "Success" : "Failed"}</span>
              </div>

              <div className="flex items-center gap-2">
                {testResults.modelsEndpoint ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Models endpoint: {testResults.modelsEndpoint ? "Success" : "Failed"}</span>
              </div>

              <div className="flex items-center gap-2">
                {testResults.chatEndpoint ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Chat completions endpoint: {testResults.chatEndpoint ? "Success" : "Failed"}</span>
              </div>

              {testResults.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{testResults.error}</AlertDescription>
                </Alert>
              )}

              {!testResults.baseConnection && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Troubleshooting tips:</p>
                    <ul className="list-disc pl-4 text-sm mt-1 space-y-1">
                      <li>Make sure LM Studio is running and the server is started</li>
                      <li>Check that the URL is correct (usually http://localhost:1234)</li>
                      <li>Ensure no firewall is blocking the connection</li>
                      <li>Try restarting LM Studio</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {testResults.baseConnection && !testResults.chatEndpoint && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">The server is running but the chat endpoint isn't responding:</p>
                    <ul className="list-disc pl-4 text-sm mt-1 space-y-1">
                      <li>Make sure you have a model loaded in LM Studio</li>
                      <li>Check that the model is properly initialized</li>
                      <li>Try restarting the server in LM Studio</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Common LM Studio issues:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Make sure you've clicked "Start Server" in LM Studio</li>
              <li>Ensure you have a model loaded before starting the server</li>
              <li>Check that no other application is using the same port</li>
              <li>For CORS issues, try using a browser extension to disable CORS</li>
              <li>If using ngrok, make sure to use the correct forwarded URL</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
