"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, XCircle, Key, User, Database, RefreshCw, LogOut, Shield, Loader2 } from "lucide-react"
import {
  getAccessToken,
  getTokenExpirationTime,
  hasValidAuthData,
  verifyTokenAccessibility,
  getExactExpirationTime,
} from "@/lib/token-service"
import { testSupabaseConnection } from "@/lib/database"

export default function AuthDebugPage() {
  const { user, session, signOut, refreshSession } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check if the user is authenticated
  const isAuthenticated = !!user && !!session

  // Get token details
  const accessToken = getAccessToken()
  const tokenExpirationTime = getTokenExpirationTime()
  const exactExpiryTime = getExactExpirationTime()

  // Verify token accessibility
  const tokenAccessibility = verifyTokenAccessibility()

  // Check if we have valid auth data
  const isValidAuthData = hasValidAuthData()

  // Test Supabase connection
  const testConnection = async () => {
    const result = await testSupabaseConnection()
    setConnectionStatus(result)
  }

  // Refresh the session
  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setIsRefreshing(false)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Debugging</h1>
      <p className="text-muted-foreground">Use this page to diagnose authentication issues and verify your setup.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User Information
            </CardTitle>
            <CardDescription>Details about the currently logged-in user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user ? (
              <>
                <div className="flex justify-between">
                  <span>User ID:</span> <span>{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Name:</span> <span>{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span> <span>{user.email}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No user logged in</p>
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Session Details
            </CardTitle>
            <CardDescription>Information about the current authentication session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {session ? (
              <>
                <div className="flex justify-between">
                  <span>Access Token:</span> <span>{accessToken ? "Present" : "Missing"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration Time:</span> <span>{exactExpiryTime || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span>User ID:</span> <span>{session.userId}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No session found</p>
            )}
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication Status
            </CardTitle>
            <CardDescription>Overall authentication status of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Authenticated:</span>
              {isAuthenticated ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex justify-between">
              <span>Valid Auth Data:</span>
              {isValidAuthData ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex justify-between">
              <span>Token Accessible:</span>
              {tokenAccessibility.tokenFound ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex justify-between">
              <span>Token Valid:</span>
              {tokenAccessibility.tokenValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supabase Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Supabase Connection
            </CardTitle>
            <CardDescription>Status of the connection to the Supabase database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectionStatus ? (
              <>
                <div className="flex justify-between">
                  <span>Status:</span>
                  {connectionStatus.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Message:</span> <span>{connectionStatus.message}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Click the button below to test the connection</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testConnection} variant="outline">
              Test Connection
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <Button onClick={handleRefreshSession} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Session
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
