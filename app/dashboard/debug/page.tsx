"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CheckCircle, XCircle, Key, User, Database, RefreshCw, LogOut, Shield, Loader2 } from "lucide-react"
import { testSupabaseConnection } from "@/lib/database"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AuthDebugPage() {
  const { user, session, signOut, refreshSession } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClientComponentClient()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)

  // Check if the user is authenticated
  const isAuthenticated = !!user && !!session

  // Test Supabase connection
  const testConnection = async () => {
    const result = await testSupabaseConnection()
    setConnectionStatus(result)
  }

  // Get Supabase session
  const getSupabaseSession = async () => {
    const { data } = await supabase.auth.getSession()
    setSupabaseSession(data.session)
    console.log("Current Supabase session:", data.session)
  }

  // Refresh the session
  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setIsRefreshing(false)
  }

  // Format expiry time
  const formatExpiryTime = (timestamp?: number) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp).toLocaleString()
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
                  <span>Access Token:</span> <span>{session.token ? "Present" : "Missing"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration Time:</span> <span>{formatExpiryTime(session.expiresAt)}</span>
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
              <span>Valid Session:</span>
              {session && session.expiresAt && session.expiresAt > Date.now() ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex justify-between">
              <span>User Data:</span>
              {user ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
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

        {/* Supabase Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Supabase Auth Status
            </CardTitle>
            <CardDescription>Direct information from Supabase Auth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {supabaseSession ? (
              <>
                <div className="flex justify-between">
                  <span>Session ID:</span>
                  <span>{supabaseSession.id ? supabaseSession.id.substring(0, 8) + "..." : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span> <span>{supabaseSession.provider || "Email"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires At:</span>
                  <span>
                    {supabaseSession.expires_at
                      ? new Date(supabaseSession.expires_at * 1000).toLocaleString()
                      : "Unknown"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Click the button below to fetch Supabase session</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={getSupabaseSession} variant="outline" size="sm">
              Fetch Supabase Session
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
