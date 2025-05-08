"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useCallback, useRef } from "react"
import { useNavigationStore } from "@/lib/navigation-state"

export function useCustomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const navigationInProgress = useRef(false)
  const {
    pendingNavigation,
    lastNavigation,
    navigationAttempts,
    setPendingNavigation,
    setLastNavigation,
    incrementNavigationAttempt,
    resetNavigationAttempt,
  } = useNavigationStore()

  // Log navigation state changes
  useEffect(() => {
    console.log("Navigation state:", {
      current: pathname,
      pending: pendingNavigation,
      last: lastNavigation,
      attempts: navigationAttempts,
    })
  }, [pathname, pendingNavigation, lastNavigation, navigationAttempts])

  // Handle navigation to quotes page specifically
  useEffect(() => {
    if (
      pendingNavigation === "/dashboard/quotes" &&
      pathname !== "/dashboard/quotes" &&
      !navigationInProgress.current
    ) {
      const attempts = navigationAttempts["/dashboard/quotes"] || 0
      console.log(`Handling pending navigation to quotes page (attempt ${attempts})`)

      navigationInProgress.current = true

      // Use a timeout to ensure we're not in the middle of a render cycle
      const timer = setTimeout(() => {
        console.log("Executing navigation to /dashboard/quotes")
        router.push("/dashboard/quotes")

        // Reset the navigation in progress flag after a short delay
        setTimeout(() => {
          navigationInProgress.current = false
        }, 500)
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [pendingNavigation, pathname, router, navigationAttempts])

  // Reset pending navigation when we reach the target
  useEffect(() => {
    if (pendingNavigation && pathname === pendingNavigation) {
      console.log(`Reached pending navigation target: ${pendingNavigation}`)
      setPendingNavigation(null)
      setLastNavigation(pendingNavigation)
      resetNavigationAttempt(pendingNavigation)
    }
  }, [pathname, pendingNavigation, setPendingNavigation, setLastNavigation, resetNavigationAttempt])

  const navigateTo = useCallback(
    (path: string) => {
      console.log(`Custom navigation request to: ${path}`)

      // If we're already on this page, don't do anything
      if (pathname === path) {
        console.log("Already on this page, skipping navigation")
        return
      }

      // Special handling for quotes page
      if (path === "/dashboard/quotes") {
        const attempts = incrementNavigationAttempt(path)
        console.log(`Navigating to quotes page (attempt ${attempts})`)

        // Set pending navigation
        setPendingNavigation(path)

        // Force direct navigation to quotes page
        console.log("Directly navigating to quotes page")
        router.push(path)
      } else {
        // For other pages, use normal navigation
        router.push(path)
      }
    },
    [pathname, router, setPendingNavigation, incrementNavigationAttempt],
  )

  return { navigateTo, currentPath: pathname }
}
