"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Quote, QuoteSortField, SortDirection } from "@/types/quotes"
import { QuoteActions } from "./quote-actions"
import { ArrowUpDown, MapPin, Loader2 } from "lucide-react"
import { EmptyState } from "./empty-state"
import { StatusBadge } from "./status-badge"

interface QuoteTableProps {
  quotes: Quote[]
  isLoading?: boolean
  error?: string | null
  sortField: QuoteSortField
  sortDirection: SortDirection
  onSort: (field: QuoteSortField) => void
  onView: (quote: Quote) => void
  onUpdateStatus?: (id: string, status: string) => void
  onDuplicate: (quote: Quote) => void
  onDelete: (id: string) => void
}

export function QuoteTable({
  quotes,
  isLoading = false,
  error = null,
  sortField,
  sortDirection,
  onSort,
  onView,
  onUpdateStatus,
  onDuplicate,
  onDelete,
}: QuoteTableProps) {
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => onSort("reference")}
                  >
                    Reference
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => onSort("customerName")}
                  >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Route</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => onSort("date")}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => onSort("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(quote)}>
                  <TableCell className="font-medium">{quote.reference || quote.id.substring(0, 8)}</TableCell>
                  <TableCell>{quote.customerName || "Unknown Customer"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="truncate max-w-[150px]">{quote.origin}</span>
                      <span className="mx-1">→</span>
                      <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="truncate max-w-[150px]">{quote.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>{quote.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <QuoteActions
                      quote={quote}
                      onView={onView}
                      onUpdateStatus={onUpdateStatus}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
