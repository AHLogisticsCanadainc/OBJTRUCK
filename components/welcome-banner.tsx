"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CalendarDays, Truck, Users } from "lucide-react"
import { useEffect, useState } from "react"

export function WelcomeBanner() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("Hello")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  if (!user) return null

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-none shadow-sm">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, {user.name}
            </h1>
            <p className="text-muted-foreground mt-1">Welcome to your TMS dashboard. Here's what's happening today.</p>
          </div>
          <div className="mt-4 flex space-x-2 md:mt-0">
            <Button variant="outline" size="sm" className="h-9">
              <Truck className="mr-2 h-4 w-4" />
              New Load
            </Button>
            <Button size="sm" className="h-9">
              <Users className="mr-2 h-4 w-4" />
              Add Carrier
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard title="Active Loads" value="24" change="+2" trend="up" icon={<Truck className="h-4 w-4" />} />
          <StatCard title="Carriers" value="18" change="+3" trend="up" icon={<Users className="h-4 w-4" />} />
          <StatCard
            title="Deliveries"
            value="5"
            change="Today"
            trend="neutral"
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </div>
      </div>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 rounded-md bg-primary/10 p-2">{icon}</div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        <TrendBadge change={change} trend={trend} />
      </div>
    </div>
  )
}

interface TrendBadgeProps {
  change: string
  trend: "up" | "down" | "neutral"
}

function TrendBadge({ change, trend }: TrendBadgeProps) {
  return (
    <div
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        trend === "up"
          ? "bg-green-100 text-green-800"
          : trend === "down"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800"
      }`}
    >
      {change}
    </div>
  )
}
