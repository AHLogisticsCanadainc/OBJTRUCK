"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Smartphone, Key, AlertTriangle, Clock, CheckCircle, XCircle, LogOut, Loader2 } from "lucide-react"

export default function SecurityPage() {
  const { user, enableMfa, disableMfa, getSecurityLog, signOut } = useAuth()
  const [isEnablingMfa, setIsEnablingMfa] = useState(false)
  const [isDisablingMfa, setIsDisablingMfa] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isSigningOut, setIsSigningOut] = useState(false)

  const securityLog = getSecurityLog()

  const handleEnableMfa = async () => {
    setIsEnablingMfa(true)
    setMessage({ type: "", text: "" })

    try {
      const result = await enableMfa()
      if (result.success) {
        setMessage({ type: "success", text: result.message || "MFA enabled successfully" })
      } else {
        setMessage({ type: "error", text: result.message || "Failed to enable MFA" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsEnablingMfa(false)
    }
  }

  const handleDisableMfa = async () => {
    setIsDisablingMfa(true)
    setMessage({ type: "", text: "" })

    try {
      const result = await disableMfa()
      if (result.success) {
        setMessage({ type: "success", text: result.message || "MFA disabled successfully" })
      } else {
        setMessage({ type: "error", text: result.message || "Failed to disable MFA" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsDisablingMfa(false)
    }
  }

  const handleSignOutAllDevices = async () => {
    setIsSigningOut(true)

    try {
      // In a real app, this would sign out all devices
      // For now, just sign out the current device
      setTimeout(() => {
        signOut()
      }, 1000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to sign out all devices" })
      setIsSigningOut(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }).format(date)
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "logout":
        return <LogOut className="h-4 w-4 text-blue-500" />
      case "failed_login":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "password_change":
        return <Key className="h-4 w-4 text-yellow-500" />
      case "mfa_enabled":
        return <Shield className="h-4 w-4 text-purple-500" />
      case "mfa_disabled":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventDescription = (event: any) => {
    switch (event.eventType) {
      case "login":
        return `Successful login via ${event.details?.method || "password"}`
      case "logout":
        return "Signed out successfully"
      case "failed_login":
        return `Failed login attempt: ${event.details?.reason || "unknown reason"}`
      case "password_change":
        return "Password changed successfully"
      case "mfa_enabled":
        return "Two-factor authentication enabled"
      case "mfa_disabled":
        return "Two-factor authentication disabled"
      default:
        return "Account activity"
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      <Tabs defaultValue="mfa" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Two-Factor Authentication</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span>Active Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Security Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by requiring a verification code in addition to your
                password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message.text && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}
                >
                  {message.type === "error" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.mfaEnabled
                      ? "Your account is protected with two-factor authentication"
                      : "Enable two-factor authentication for enhanced security"}
                  </p>
                </div>
                <Switch
                  checked={user?.mfaEnabled || false}
                  onCheckedChange={user?.mfaEnabled ? handleDisableMfa : handleEnableMfa}
                  disabled={isEnablingMfa || isDisablingMfa}
                />
              </div>

              <div className="rounded-md bg-amber-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Security Recommendation</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Two-factor authentication adds an important layer of security to your account. We strongly
                        recommend enabling this feature to protect your sensitive financial data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage your active sessions and sign out from other devices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-primary-50 border border-primary-200 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-primary-900">Current Session</h3>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Active
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p>Browser: {navigator.userAgent.split(" ").slice(-1)[0]}</p>
                        <p>Device: {navigator.platform}</p>
                        <p>IP Address: 127.0.0.1 (localhost)</p>
                        <p>Last Activity: Just now</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* This would be populated with real session data in a production app */}
                <div className="rounded-md bg-gray-50 border border-gray-200 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Mobile App</h3>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Inactive
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p>Device: iPhone 13</p>
                        <p>IP Address: 192.168.1.1</p>
                        <p>Last Activity: 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleSignOutAllDevices}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out All Devices
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Security Activity Log
              </CardTitle>
              <CardDescription>Review recent security-related activity on your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLog.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {securityLog
                      .slice()
                      .reverse()
                      .map((event, index) => (
                        <div key={index} className="p-4 flex items-start">
                          <div className="mr-4 mt-0.5">{getEventIcon(event.eventType)}</div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium text-sm">{getEventDescription(event)}</p>
                              <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {event.details?.deviceInfo?.browser ||
                                event.userAgent?.split(" ").slice(-1)[0] ||
                                "Unknown device"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No security activity recorded yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
