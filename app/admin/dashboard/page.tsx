"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldAlert, Users, Truck, Building, Loader2, Clock } from "lucide-react"
import { AdminSignOutButton } from "@/components/admin-sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
      <CardFooter className="text-gray-500">{icon}</CardFooter>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { admin, signOut, isLoading } = useAdminAuth()
  const router = useRouter()
  const isMobile = useIsMobile()

  // If admin is not logged in, redirect to admin login
  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/admin/login")
    }
  }, [admin, isLoading, router])

  if (isLoading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <ShieldAlert className="h-6 w-6 md:h-8 md:w-8 text-primary mr-2 md:mr-3" />
            <h1 className="text-lg md:text-xl font-bold text-foreground">Admin Portal</h1>
          </div>
          <div className="flex items-center">
            {!isMobile && (
              <span className="text-sm text-muted-foreground mr-4">
                Logged in as <span className="font-medium text-foreground">{admin.name}</span>
              </span>
            )}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <AdminSignOutButton variant="outline" size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Welcome, {admin.name}</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your transportation management system from this dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard title="Total Users" value="24" icon={<Users className="h-5 w-5" />} />
          <StatCard title="Active Loads" value="18" icon={<Truck className="h-5 w-5" />} />
          <StatCard title="Carriers" value="12" icon={<Building className="h-5 w-5" />} />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="loads" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Loads</span>
            </TabsTrigger>
            <TabsTrigger value="carriers" className="flex items-center gap-2 hidden md:flex">
              <Building className="h-4 w-4" />
              <span>Carriers</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 hidden md:flex">
              <Clock className="h-4 w-4" />
              <span>Activity Log</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">User management functionality coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loads">
            <Card>
              <CardHeader>
                <CardTitle>Load Management</CardTitle>
                <CardDescription>View and manage all loads in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">Load management functionality coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carriers">
            <Card>
              <CardHeader>
                <CardTitle>Carrier Management</CardTitle>
                <CardDescription>View and manage all carriers in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">Carrier management functionality coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>View system activity and login attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">Activity log functionality coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
