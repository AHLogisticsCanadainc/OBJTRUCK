"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Quote } from "@/types/quotes"
import { QuoteActions } from "./quote-actions"
import { FileText, MapPin, Calendar, Loader2 } from "lucide-react"
import { EmptyState } from "./empty-state"
import { StatusBadge } from "./status-badge"

interface QuoteCardsProps {
  quotes: Quote[]
  isLoading?: boolean
  error?: string | null
  onView: (quote: Quote) => void
  onUpdateStatus?: (id: string, status: string) => void
  onDuplicate: (quote: Quote) => void
  onDelete: (id: string) => void
}

export function QuoteCards({
  quotes,
  isLoading = false,
  error = null,
  onView,
  onUpdateStatus,
  onDuplicate,
  onDelete,
}: QuoteCardsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading quotes...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (quotes.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quotes.map((quote) => (
        <Card key={quote.id} className="data-card">
          <CardHeader className="data-card-header py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                {quote.reference || quote.id.substring(0, 8)}
              </CardTitle>
              <StatusBadge status={quote.status} />
            </div>
          </CardHeader>
          <CardContent className="data-card-content py-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{quote.customerName || "Unknown Customer"}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {quote.date}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Route</p>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1 text-primary" />
                    <span className="truncate">{quote.origin}</span>
                    <span className="mx-1">→</span>
                    <MapPin className="h-3 w-3 mr-1 text-primary" />
                    <span className="truncate">{quote.destination}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="data-card-footer py-2 flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => onView(quote)}>
              View Details
            </Button>
            <QuoteActions
              quote={quote}
              onView={onView}
              onUpdateStatus={onUpdateStatus}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
