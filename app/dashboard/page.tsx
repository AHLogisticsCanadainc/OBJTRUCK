"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuotes } from "@/hooks/use-quotes"
import { useAuth } from "@/components/auth-provider"
import { CreateQuoteForm } from "@/components/quotes/create-quote-form"
import { QuotesDirectLink } from "@/components/quotes/quotes-direct-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Truck, Users, FileText, Calendar, ArrowRight, Plus, Loader2, TrendingUp, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { quotes, isLoading: quotesLoading, createQuote } = useQuotes()
  const { user } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Simulate loading data for stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingStats(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Calculate quote stats
  const pendingQuotes = quotes.filter((q) => q.status.toLowerCase() === "pending").length
  const approvedQuotes = quotes.filter((q) => q.status.toLowerCase() === "approved").length
  const rejectedQuotes = quotes.filter((q) => q.status.toLowerCase() === "rejected").length
  const expiredQuotes = quotes.filter((q) => q.status.toLowerCase() === "expired").length
  const totalQuotes = quotes.length

  // Get recent quotes (last 5)
  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
    .slice(0, 5)

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    setLoadingStats(true)

    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false)
      setLoadingStats(false)
    }, 1500)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your transportation management today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="h-9">
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button size="sm" className="h-9" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Loads"
          value="18"
          subtitle="5 scheduled for today"
          icon={<Truck className="h-5 w-5" />}
          trend="+12% from last week"
          trendUp={true}
          loading={loadingStats}
        />

        <MetricCard
          title="Active Carriers"
          value="12"
          subtitle="4 with active loads"
          icon={<Users className="h-5 w-5" />}
          trend="Same as last week"
          trendUp={null}
          loading={loadingStats}
        />

        <MetricCard
          title="Pending Quotes"
          value={pendingQuotes.toString()}
          subtitle={`${approvedQuotes} approved, ${rejectedQuotes} rejected`}
          icon={<FileText className="h-5 w-5" />}
          trend={totalQuotes > 0 ? `${Math.round((pendingQuotes / totalQuotes) * 100)}% of total` : "No quotes"}
          trendUp={null}
          loading={quotesLoading}
        />

        <MetricCard
          title="Today's Deliveries"
          value="5"
          subtitle="3 completed, 2 in transit"
          icon={<Calendar className="h-5 w-5" />}
          trend="On schedule"
          trendUp={null}
          loading={loadingStats}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <CardDescription>Your latest quotes and activities</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {quotesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentQuotes.length > 0 ? (
              <div className="divide-y">
                {recentQuotes.map((quote, index) => (
                  <div key={quote.id} className="flex items-start p-4 hover:bg-muted/50 transition-colors">
                    <div className="mr-4 mt-0.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">Quote {quote.reference || quote.id.substring(0, 8)}</p>
                        <StatusBadge status={quote.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{quote.customerName || "Unknown Customer"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quote.created_at || "").toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No recent activity</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any quotes yet. Create your first quote to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quote
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between" onClick={() => setIsCreateDialogOpen(true)}>
                <span className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Quote
                </span>
                <Plus className="h-4 w-4" />
              </Button>

              <QuotesDirectLink />

              <Link href="/dashboard/loads" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    Manage Loads
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/dashboard/carriers" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Carriers
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/dashboard/carrier-lookup" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    Carrier Lookup
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quote Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Status</CardTitle>
              <CardDescription>Overview of your quotes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : totalQuotes > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="text-sm font-medium">{pendingQuotes}</span>
                    </div>
                    <Progress value={(pendingQuotes / totalQuotes) * 100} className="h-2 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Approved</span>
                      </div>
                      <span className="text-sm font-medium">{approvedQuotes}</span>
                    </div>
                    <Progress value={(approvedQuotes / totalQuotes) * 100} className="h-2 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm">Rejected</span>
                      </div>
                      <span className="text-sm font-medium">{rejectedQuotes}</span>
                    </div>
                    <Progress value={(rejectedQuotes / totalQuotes) * 100} className="h-2 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-gray-500 mr-2"></div>
                        <span className="text-sm">Expired</span>
                      </div>
                      <span className="text-sm font-medium">{expiredQuotes}</span>
                    </div>
                    <Progress value={(expiredQuotes / totalQuotes) * 100} className="h-2 bg-muted" />
                  </div>

                  <Separator className="my-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Quotes</span>
                    <span className="text-sm font-medium">{totalQuotes}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No quotes available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Quote Dialog */}
      <CreateQuoteForm open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={createQuote} />
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase()

  if (statusLower === "pending") {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
        Pending
      </Badge>
    )
  } else if (statusLower === "approved") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
        Approved
      </Badge>
    )
  } else if (statusLower === "rejected") {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
        Rejected
      </Badge>
    )
  } else if (statusLower === "expired") {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
        Expired
      </Badge>
    )
  }

  return <Badge variant="outline">{status}</Badge>
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend: string
  trendUp: boolean | null // true = up, false = down, null = neutral
  loading: boolean
}

function MetricCard({ title, value, subtitle, icon, trend, trendUp, loading }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-muted rounded animate-pulse mt-2"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <div className="mt-4 flex items-center text-xs">
              {trendUp === true && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
              {trendUp === false && <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />}
              {trendUp === null && <Clock className="mr-1 h-3 w-3 text-muted-foreground" />}
              <span
                className={`${
                  trendUp === true ? "text-green-500" : trendUp === false ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {trend}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
