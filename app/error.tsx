"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Copy } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  const copyErrorDetails = () => {
    const errorDetails = `
Error: ${error.message}
Stack: ${error.stack || "No stack trace available"}
Digest: ${error.digest || "No digest available"}
Time: ${new Date().toISOString()}
    `.trim()

    navigator.clipboard
      .writeText(errorDetails)
      .then(() => alert("Error details copied to clipboard"))
      .catch((err) => console.error("Failed to copy error details", err))
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50" role="alert" aria-live="assertive">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription className="text-lg">An error occurred while processing your request</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4 rounded-md bg-destructive/10 p-4 text-left">
            <p className="font-medium text-destructive">{error?.message || "Unknown error occurred"}</p>
            {error?.stack && (
              <div className="mt-2 max-h-32 overflow-auto rounded bg-muted/50 p-2 text-xs font-mono">
                {error.stack.split("\n").slice(0, 3).join("\n")}
              </div>
            )}
            {error?.digest && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Error ID: {error.digest}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copyErrorDetails}
                  title="Copy error details"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
          <Link href="/auth/signin">
            <Button>Return to Sign In</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
