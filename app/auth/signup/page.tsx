"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Mail, Lock, User, Info, CheckCircle, XCircle, Shield } from "lucide-react"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { signUp, checkPasswordStrength, user } = useAuth()
  const router = useRouter()

  // If user is already logged in, redirect to dashboard
  // useEffect(() => {
  //   if (user) {
  //     router.push("/")
  //   }
  // }, [user, router])

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      setPasswordFeedback([])
      return
    }

    const result = checkPasswordStrength(password)
    setPasswordStrength(result.score)
    setPasswordFeedback(result.feedback)
  }, [password, checkPasswordStrength])

  // Check if passwords match
  useEffect(() => {
    if (!confirmPassword) return
    setPasswordMatch(password === confirmPassword)
  }, [password, confirmPassword])

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Weak"
    if (passwordStrength < 70) return "Good"
    return "Strong"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (passwordStrength < 50) {
      setError("Please choose a stronger password")
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp(firstName, lastName, email, password)
      if (result.success) {
        setSuccessMessage("Your account has been created! Please check your email for a verification link.")

        // Wait 3 seconds then redirect to sign-in with email confirmation notification
        // setTimeout(() => {
        //   router.push(`/auth/signin?email=${encodeURIComponent(email)}&emailSent=true`)
        // }, 3000)
      } else {
        setError(result.message || "Failed to create account. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Sign up to get started with A.H Logistics TMS</p>
        </div>

        <Card className="border border-gray-200 shadow-xl shadow-gray-100">
          <CardHeader>
            <CardTitle className="text-xl text-center">Sign Up</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="text-sm bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="pl-10"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading || !!successMessage}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading || !!successMessage}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || !!successMessage}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || !!successMessage}
                    required
                  />
                </div>

                {password && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Password Strength:</span>
                      <span
                        className={
                          passwordStrength >= 70
                            ? "text-green-600"
                            : passwordStrength >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {getStrengthText()}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className={`h-1 ${getStrengthColor()}`} />

                    {passwordFeedback.length > 0 && (
                      <ul className="text-xs text-gray-500 mt-1 space-y-1">
                        {passwordFeedback.map((feedback, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <Info className="h-3 w-3 flex-shrink-0" />
                            <span>{feedback}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`pl-10 ${confirmPassword && !passwordMatch ? "border-red-500" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || !!successMessage}
                    required
                  />
                </div>

                {confirmPassword && (
                  <div className="flex items-center gap-1 text-xs mt-1">
                    {passwordMatch ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  disabled={isLoading || !!successMessage}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-tight cursor-pointer">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
                <Shield className="h-3 w-3" />
                <span>Your data is encrypted and secure</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-10"
                disabled={isLoading || !!successMessage || !agreedToTerms || !passwordMatch || passwordStrength < 50}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : successMessage ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Account Created
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-8">
          &copy; {new Date().getFullYear()} FinancePro CRM. All rights reserved.
        </p>
      </div>
    </div>
  )
}
