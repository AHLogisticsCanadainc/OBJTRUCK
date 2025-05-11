"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { getTokenExpirationTime, isTokenExpired } from "@/lib/token-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, X, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

interface SessionExpiryWarningProps {
  warningThresholdMinutes?: number
  criticalThresholdMinutes?: number
}

export function SessionExpiryWarning({
  warningThresholdMinutes = 10,
  criticalThresholdMinutes = 2,
}: SessionExpiryWarningProps) {
  const { session, refreshSession, signOut } = useAuth()
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [expiresIn, setExpiresIn] = useState<string>("")
  const [exactExpiryTime, setExactExpiryTime] = useState<string>("")
  const [isCritical, setIsCritical] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)

  const checkSessionExpiry = useCallback(() => {
    if (!session || isDismissed) return

    const expiryTime = getTokenExpirationTime()
    if (!expiryTime) return

    const now = Date.now()
    const timeRemaining = expiryTime - now
    const minutesRemaining = Math.floor(timeRemaining / (60 * 1000))

    // Check if token is already expired
    if (isTokenExpired()) {
      console.log("⚠️ Token has expired, signing out automatically")
      // Store current path for redirect after login
      if (typeof window !== "undefined" && window.location.pathname !== "/auth/signin") {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname)
        sessionStorage.setItem("authRedirectReason", "Your session has expired. Please sign in again.")
      }

      // Sign out and redirect
      signOut()
      return
    }

    // Format the exact expiry time
    const expiryDate = new Date(expiryTime)
    setExactExpiryTime(expiryDate.toLocaleString())

    // Format the time remaining
    if (minutesRemaining < 60) {
      setExpiresIn(`${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}`)
    } else {
      const hours = Math.floor(minutesRemaining / 60)
      const mins = minutesRemaining % 60
      setExpiresIn(`${hours} hour${hours !== 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`)
    }

    // Show warning if session is about to expire
    const shouldShowWarning = minutesRemaining <= warningThresholdMinutes
    setShowWarning(shouldShowWarning)

    // Set critical state if very close to expiry
    setIsCritical(minutesRemaining <= criticalThresholdMinutes)

    // If we're showing a warning and the last refresh was more than 5 minutes ago,
    // automatically try to refresh the session
    if (shouldShowWarning && (!lastRefreshTime || now - lastRefreshTime > 5 * 60 * 1000)) {
      handleRefresh()
    }
  }, [session, warningThresholdMinutes, criticalThresholdMinutes, isDismissed, lastRefreshTime, signOut])

  useEffect(() => {
    // Check immediately and then every 30 seconds
    checkSessionExpiry()
    const interval = setInterval(checkSessionExpiry, 30 * 1000)

    return () => clearInterval(interval)
  }, [checkSessionExpiry])

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const success = await refreshSession()
      if (success) {
        setShowWarning(false)
        setIsCritical(false)
        setLastRefreshTime(Date.now())
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setShowWarning(false)

    // Only dismiss for 5 minutes
    setTimeout(
      () => {
        setIsDismissed(false)
      },
      5 * 60 * 1000,
    )
  }

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-md"
        >
          <Alert
            className={`border shadow-lg ${
              isCritical ? "bg-red-50 border-red-300 text-red-800" : "bg-amber-50 border-amber-300 text-amber-800"
            }`}
          >
            <Clock className={`h-4 w-4 ${isCritical ? "text-red-600" : "text-amber-600"}`} />
            <AlertTitle className="flex items-center justify-between">
              <span>{isCritical ? "Session Expiring Very Soon!" : "Session Expiring Soon"}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full -mr-2" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                Your session will expire in <strong>{expiresIn}</strong>
                <br />
                <span className="text-xs opacity-80">Exact time: {exactExpiryTime}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant={isCritical ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`${
                    isCritical
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-amber-100 hover:bg-amber-200 border-amber-300"
                  }`}
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    "Extend Session"
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
