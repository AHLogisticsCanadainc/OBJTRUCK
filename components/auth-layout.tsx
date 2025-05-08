"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Sidebar, SidebarProvider } from "./sidebar"
import { MainContent } from "./main-content"
import { Loader2 } from "lucide-react"

// Update the component to properly use the SidebarProvider
export function AuthLayout({ children }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Auth pages don't need the sidebar
  const isAuthPage = pathname.startsWith("/auth/")

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin">
          <Loader2 className="h-8 w-8 text-primary" />
        </div>
      </div>
    )
  }

  // For auth pages, render without sidebar
  if (isAuthPage || !user) {
    return <>{children}</>
  }

  // For authenticated pages with sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  )
}
