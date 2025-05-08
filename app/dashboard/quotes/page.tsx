"use client"

import { QuotingManager } from "@/components/quotes/quoting-manager"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function QuotesPage() {
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)

  // Add logging to track when the page component mounts
  useEffect(() => {
    console.log("Quotes page component mounted at:", pathname)

    // Mark as ready immediately to avoid delays
    setIsReady(true)

    return () => {
      console.log("Quotes page component unmounted")
    }
  }, [pathname])

  // If not ready, show loading spinner
  if (!isReady) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading quotes manager..." />
      </div>
    )
  }

  return <QuotingManager />
}
