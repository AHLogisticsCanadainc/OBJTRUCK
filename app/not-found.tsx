"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50" role="alert" aria-live="assertive">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription className="text-xl font-medium">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
          <div className="mt-4 rounded-md bg-muted p-4 text-left">
            <h3 className="mb-2 font-semibold">Possible reasons:</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>The URL may be misspelled or incorrect</li>
              <li>The page may have been deleted or moved</li>
              <li>You may not have permission to access this resource</li>
              <li>The link you followed may be outdated</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Link href="/auth/signin">
            <Button>Return to Sign In</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
