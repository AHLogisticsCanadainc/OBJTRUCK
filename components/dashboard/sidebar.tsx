"use client"
import type React from "react"

import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  FileText,
  Menu,
  ChevronRight,
  Settings,
  LogOut,
  HelpCircle,
  User,
  Truck,
  Building,
  Users,
  BarChart,
  Calendar,
  FileArchive,
  Home,
  Shield,
  MessageSquare,
  Wrench,
  MapPin,
  Bug,
} from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useCustomNavigation } from "@/hooks/use-custom-navigation"

// Navigation items - FIXED to avoid duplicate keys
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview of your system",
  },
  {
    title: "Quoting Manager",
    href: "/dashboard/quotes",
    icon: FileText,
    description: "Manage all your quotes",
  },
  {
    title: "Carrier Lookup",
    href: "/dashboard/carrier-lookup",
    icon: Truck,
    description: "Look up carrier information",
  },
  {
    title: "Loads",
    href: "/dashboard/loads",
    icon: Truck,
    description: "Manage your loads",
  },
  {
    title: "Carriers",
    href: "/dashboard/carriers",
    icon: Building,
    description: "Manage your carriers",
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    description: "Manage your customers",
  },
  {
    title: "Locations",
    href: "/dashboard/locations",
    icon: MapPin,
    description: "Manage pickup and delivery locations",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart,
    description: "View reports and analytics",
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileArchive,
    description: "Manage your documents",
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    description: "View your calendar",
  },
  {
    title: "AI Chat",
    href: "/dashboard/ai-chat",
    icon: MessageSquare,
    description: "Chat with AI assistant",
  },
  {
    title: "Tools",
    href: "/dashboard/tools",
    icon: Wrench,
    description: "Specialized tools and calculators",
  },
  {
    title: "Authentication Debug",
    href: "/dashboard/debug",
    icon: Bug,
    description: "Debug authentication issues",
  },
]

// Settings and profile navigation items
const settingsItems = [
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Manage your profile",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configure system settings",
  },
  {
    title: "Security",
    href: "/dashboard/security",
    icon: Shield,
    description: "Manage security settings",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { navigateTo } = useCustomNavigation()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Handle navigation with our custom hook
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    console.log(`Navigation requested to: ${href}`)
    navigateTo(href)
  }

  // Mobile sidebar using Sheet component
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-[#ed1c23] text-white shadow-lg hover:bg-[#ed1c23]/90 focus:outline-none focus:ring-2 focus:ring-[#ed1c23] focus:ring-offset-2"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-[300px] border-r">
            {/* Logo */}
            <div className="p-4 border-b flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-2">
                  <Image src="/images/ah-logo.png" alt="A.H Logistics Logo" fill className="object-contain" priority />
                </div>
                <h1 className="text-xs font-bold text-black uppercase">A.H LOGISTICS CANADA INC</h1>
              </div>
            </div>

            {/* User profile section */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-[#ed1c23]/20">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-[#ed1c23]/10 text-[#ed1c23] font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="overflow-y-auto h-[calc(100vh-180px)] py-4">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-1">Main</h3>
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors w-full text-left",
                      pathname === item.href
                        ? "bg-[#ed1c23]/10 text-[#ed1c23] font-medium"
                        : "text-foreground hover:bg-muted",
                    )}
                    onClick={() => {
                      setIsOpen(false)
                      navigateTo(item.href)
                    }}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span>{item.title || item.name}</span>
                    </div>
                    {pathname === item.href && <ChevronRight className="h-4 w-4 text-[#ed1c23]" />}
                  </button>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-1">Settings</h3>
                {settingsItems.map((item) => (
                  <button
                    key={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors w-full text-left",
                      pathname === item.href
                        ? "bg-[#ed1c23]/10 text-[#ed1c23] font-medium"
                        : "text-foreground hover:bg-muted",
                    )}
                    onClick={() => {
                      setIsOpen(false)
                      navigateTo(item.href)
                    }}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    {pathname === item.href && <ChevronRight className="h-4 w-4 text-[#ed1c23]" />}
                  </button>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="px-3">
                <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-1">Support</h3>
                <button className="flex items-center px-3 py-2 rounded-md text-sm transition-colors text-foreground hover:bg-muted w-full text-left">
                  <HelpCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span>Help & Resources</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <SignOutButton
                variant="outline"
                className="w-full bg-white hover:bg-gray-100 border-gray-200 text-gray-800"
              />
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className="h-screen w-64 flex-shrink-0 border-r bg-card overflow-hidden flex flex-col">
      {/* Logo and branding */}
      <div className="p-4 border-b flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-2">
          <Image src="/images/ah-logo.png" alt="A.H Logistics Logo" fill className="object-contain" priority />
        </div>
        <h1 className="text-xs font-bold text-black uppercase">A.H LOGISTICS CANADA INC</h1>
      </div>

      {/* User profile section */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-[#ed1c23]/20">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
            <AvatarFallback className="bg-[#ed1c23]/10 text-[#ed1c23] font-medium">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-1">Main</h3>
          {navItems.map((item) => (
            <button
              key={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group w-full text-left",
                pathname === item.href
                  ? "bg-[#ed1c23]/10 text-[#ed1c23] font-medium"
                  : "text-foreground hover:bg-muted",
              )}
              onClick={() => navigateTo(item.href)}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center mr-3 transition-colors",
                    pathname === item.href
                      ? "bg-[#ed1c23]/20 text-[#ed1c23]"
                      : "bg-muted text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.title || item.name}</span>
              </div>
              {pathname === item.href && <ChevronRight className="h-4 w-4 text-[#ed1c23]" />}
            </button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="px-3 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-1">Settings</h3>
          {settingsItems.map((item) => (
            <button
              key={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group w-full text-left",
                pathname === item.href
                  ? "bg-[#ed1c23]/10 text-[#ed1c23] font-medium"
                  : "text-foreground hover:bg-muted",
              )}
              onClick={() => navigateTo(item.href)}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center mr-3 transition-colors",
                    pathname === item.href
                      ? "bg-[#ed1c23]/20 text-[#ed1c23]"
                      : "bg-muted text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.title}</span>
              </div>
              {pathname === item.href && <ChevronRight className="h-4 w-4 text-[#ed1c23]" />}
            </button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="px-3">
          <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-1">Support</h3>
          <button className="flex items-center px-3 py-2 rounded-md text-sm transition-colors text-foreground hover:bg-muted w-full text-left">
            <div className="h-8 w-8 rounded-md flex items-center justify-center mr-3 transition-colors bg-muted text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
            </div>
            <span>Help & Resources</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-muted/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>
        <SignOutButton
          variant="outline"
          className="w-full flex items-center justify-center bg-white hover:bg-gray-100 border-gray-200 text-gray-800"
          size="sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </SignOutButton>
      </div>
    </div>
  )
}
