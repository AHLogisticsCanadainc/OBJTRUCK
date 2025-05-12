"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, X, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getSupabaseClient } from "@/lib/database"

interface SessionExpiryWarningProps {
  warningThresholdMinutes?: number
  criticalThresholdMinutes?: number
}

export function SessionExpiryWarning({
  warningThresholdMinutes = 10,
  criticalThresholdMinutes = 2,
}: SessionExpiryWarningProps) {
  const { session, refreshSession } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [expiresIn, setExpiresIn] = useState<string>("")
  const [exactExpiryTime, setExactExpiryTime] = useState<string>("")
  const [isCritical, setIsCritical] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const checkSessionExpiry = useCallback(async () => {
    if (isDismissed) return

    try {
      // Get the current session from Supabase
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        // No session, no need to show warning
        setShowWarning(false)
        return
      }

      // Calculate expiry time
      const expiryTime = data.session.expires_at ? new Date(data.session.expires_at * 1000).getTime() : 0

      if (!expiryTime) {
        setShowWarning(false)
        return
      }

      const now = Date.now()
      const timeRemaining = expiryTime - now
      const minutesRemaining = Math.floor(timeRemaining / (60 * 1000))

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

      // If we're showing a warning and it's critical, automatically try to refresh the session
      if (shouldShowWarning && minutesRemaining <= criticalThresholdMinutes && !isRefreshing) {
        handleRefresh()
      }
    } catch (error) {
      console.error("Error checking session expiry:", error)
    }
  }, [warningThresholdMinutes, criticalThresholdMinutes, isDismissed, isRefreshing])

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
