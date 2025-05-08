"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerCrash } from "lucide-react"

export default function InternalServerError() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50" role="alert" aria-live="assertive">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ServerCrash className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl">500</CardTitle>
          <CardDescription className="text-xl font-medium">Internal Server Error</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            Our server encountered an error and could not complete your request.
          </p>
          <div className="mt-4 rounded-md bg-muted p-4 text-left">
            <h3 className="mb-2 font-semibold">Technical Details:</h3>
            <p className="text-sm text-muted-foreground">
              The server encountered an unexpected condition that prevented it from fulfilling the request. This is
              typically a temporary issue.
            </p>
            <div className="mt-3 rounded-md bg-destructive/10 p-3 text-xs font-mono text-destructive">
              Error: Internal Server Error (500)
              <br />
              Time: {new Date().toISOString()}
              <br />
              Request ID: {Math.random().toString(36).substring(2, 15)}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Link href="/auth/signin" className="flex-1">
              <Button className="w-full">Return to Sign In</Button>
            </Link>
          </div>
          <Button variant="link" size="sm" className="text-xs">
            Report this issue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
