"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { testResendConnection } from "@/app/actions/email-test-action"
import { Mail, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EmailTestButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    domains?: number
  } | null>(null)

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      const response = await testResendConnection()
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleTestConnection} disabled={isLoading} variant="outline">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing Connection...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Test Email Connection
          </>
        )}
      </Button>

      {result && (
        <Alert
          variant={result.success ? "default" : "destructive"}
          className={result.success ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : ""}
        >
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle className={result.success ? "text-green-600 dark:text-green-400" : ""}>
            {result.success ? "Connection Successful" : "Connection Failed"}
          </AlertTitle>
          <AlertDescription className={result.success ? "text-green-600/90 dark:text-green-400/90" : ""}>
            {result.message}
            {result.success && result.domains !== undefined && (
              <span className="block mt-1">
                Found {result.domains} domain{result.domains !== 1 ? "s" : ""} in your Resend account.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
