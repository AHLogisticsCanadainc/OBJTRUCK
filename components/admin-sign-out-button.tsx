"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { useToast } from "@/components/ui/use-toast"

interface AdminSignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function AdminSignOutButton({ variant = "outline", size = "default", className = "" }: AdminSignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { signOut } = useAdminAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    try {
      await signOut()
      // The auth provider will handle redirection
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)

      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleSignOut} disabled={isSigningOut} className={className}>
      {isSigningOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing Out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  )
}
