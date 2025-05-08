"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertOctagon } from "lucide-react"

export default function GlobalError({
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

  return (
    <html>
      <body>
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <AlertOctagon className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-3xl">Critical Error</CardTitle>
              <CardDescription className="text-xl font-medium">Application Error</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                The application encountered a critical error and cannot continue.
              </p>
              {error?.digest && <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={reset}>Try Again</Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}
