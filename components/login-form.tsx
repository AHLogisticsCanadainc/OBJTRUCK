"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="auth-button">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md border-primary/20">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">CCIA Insurance Portal</CardTitle>
        <CardDescription className="text-center">Sign in to access your agent dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && <div className="error-message">{state.error}</div>}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="auth-input"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input id="password" name="password" type="password" required className="auth-input" />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center text-muted-foreground">
            Don't have an account? <Link href="/auth/sign-up">Contact your administrator</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
