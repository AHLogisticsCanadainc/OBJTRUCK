"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { ThemeToggle } from "@/components/theme-toggle"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="auth-button">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing up...
        </>
      ) : (
        "Sign Up"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  // Initialize with null as the initial state
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="auth-form">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <div className="space-y-2 text-center">
        <h1>Create an account</h1>
        <p className="text-lg text-muted-foreground">Sign up to get started</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && <div className="error-message">{state.error}</div>}

        {state?.success && <div className="success-message">{state.success}</div>}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required className="auth-input" />
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
          Already have an account? <Link href="/auth/login">Log in</Link>
        </div>
      </form>
    </div>
  )
}
