"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, FileText, Shield, Settings, Home, FileCheck, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut } from "@/lib/actions"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-primary",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/dashboard/clients",
    color: "text-primary",
  },
  {
    label: "Policies",
    icon: Shield,
    href: "/dashboard/policies",
    color: "text-primary",
  },
  {
    label: "Documents",
    icon: FileText,
    href: "/dashboard/documents",
    color: "text-primary",
  },
  {
    label: "Compliance",
    icon: FileCheck,
    href: "/dashboard/compliance",
    color: "text-primary",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-muted-foreground",
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background border-r">
      <div className="px-3 py-4 flex flex-col h-full">
        <div className="flex items-center pl-3 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary">CCIA</h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-2 text-sm font-medium rounded-lg px-3 py-2 hover:bg-accent",
                pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              {route.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto space-y-4">
          <form action={signOut}>
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              type="submit"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Log out
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
