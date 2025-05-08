"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Quote } from "@/types/quotes"
import { useQuotes } from "@/hooks/use-quotes"
import { SearchAndFilters } from "./search-and-filters"
import { QuoteTable } from "./quote-table"
import { QuoteCards } from "./quote-cards"
import { QuoteDetails } from "./quote-details"
import { CreateQuoteForm } from "./create-quote-form"
import { FileText, PlusCircle, Download, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DeleteQuoteDialog } from "./delete-quote-dialog"
import { usePathname } from "next/navigation"

export function QuotingManager() {
  const pathname = usePathname()

  // Log when the component mounts to help with debugging
  useEffect(() => {
    console.log("QuotingManager mounted at path:", pathname)
  }, [pathname])

  const {
    quotes,
    totalQuotes,
    isLoading,
    error,
    filters,
    sortField,
    sortDirection,
    createQuote,
    updateQuote,
    deleteQuote,
    duplicateQuote,
    handleSort,
    resetFilters,
    setSearchTerm,
    setStatusFilter,
    setDateRangeFilter,
    refreshQuotes,
  } = useQuotes()

  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null)

  // Add a loading state to prevent premature redirects
  const [isComponentReady, setIsComponentReady] = useState(false)

  useEffect(() => {
    // Mark component as ready after a short delay
    const timer = setTimeout(() => {
      setIsComponentReady(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsViewDialogOpen(true)
  }

  const handleDeleteQuote = async (id: string) => {
    const quoteToDelete = quotes.find((q) => q.id === id)
    if (quoteToDelete) {
      setQuoteToDelete(quoteToDelete)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleDeleteSuccess = () => {
    refreshQuotes()
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateQuote(id, { status })
  }

  // If the component is not ready yet, show a simple loading state
  if (!isComponentReady) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading quotes manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Quoting Manager</h1>
          <p className="text-muted-foreground mt-1">Create and manage transportation quotes</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
          >
            {viewMode === "table" ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Card View
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Table View
              </>
            )}
          </Button>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quote
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter Section */}
      <SearchAndFilters
        searchTerm={filters.searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={filters.status || "all"}
        onStatusFilterChange={setStatusFilter}
        dateRange={filters.dateRange}
        onDateRangeChange={setDateRangeFilter}
        onResetFilters={resetFilters}
      />

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading quotes..."
          ) : (
            <>
              Showing {quotes.length} of {totalQuotes} quotes
              {filters.searchTerm && ` matching "${filters.searchTerm}"`}
              {filters.status && filters.status !== "all" && ` with status "${filters.status}"`}
              {(filters.dateRange.from || filters.dateRange.to) && " in selected date range"}
            </>
          )}
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {quotes.length > 0 && !isLoading && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden flex-1"
                onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
              >
                {viewMode === "table" ? "Card View" : "Table View"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quotes Display */}
      {viewMode === "table" ? (
        <QuoteTable
          quotes={quotes}
          isLoading={isLoading}
          error={error}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={handleViewQuote}
          onUpdateStatus={handleUpdateStatus}
          onDuplicate={duplicateQuote}
          onDelete={handleDeleteQuote}
        />
      ) : (
        <QuoteCards
          quotes={quotes}
          isLoading={isLoading}
          error={error}
          onView={handleViewQuote}
          onUpdateStatus={handleUpdateStatus}
          onDuplicate={duplicateQuote}
          onDelete={handleDeleteQuote}
        />
      )}

      {/* Quote Details Dialog */}
      {selectedQuote && (
        <QuoteDetails
          quote={selectedQuote}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          onUpdateQuote={updateQuote}
        />
      )}

      {/* Create Quote Dialog */}
      <CreateQuoteForm open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={createQuote} />

      {/* Delete Quote Dialog */}
      {quoteToDelete && (
        <DeleteQuoteDialog
          quoteId={quoteToDelete.id}
          quoteName={quoteToDelete.reference || quoteToDelete.id.substring(0, 8)}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}
