"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Search,
  Truck,
  Eye,
  X,
  ChevronDown,
  ListFilter,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  MapPin,
} from "lucide-react"
import {
  useCarrierLookupResults,
  type CarrierLookupFilters,
  type CarrierLookupResult,
} from "@/hooks/use-carrier-lookup-results"
import { LoadingSpinner } from "@/components/loading-spinner"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CarrierDetailsDialog } from "./carrier-details-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PAGE_SIZE_OPTIONS = [
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
  { value: "200", label: "200 per page" },
  { value: "400", label: "400 per page" },
]

type AddressFilter = {
  field: "zip" | "city" | "state" | "street" | "country"
  value: string
}

export function SystemCarriersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState("50")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<CarrierLookupFilters>({
    limit: 50,
    offset: 0,
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Address filtering (client-side)
  const [addressFilters, setAddressFilters] = useState<AddressFilter[]>([])
  const [addressFilterField, setAddressFilterField] = useState<AddressFilter["field"]>("state")
  const [addressFilterValue, setAddressFilterValue] = useState("")

  // Unique address values for dropdowns
  const [uniqueAddressValues, setUniqueAddressValues] = useState<{
    zip: Set<string>
    city: Set<string>
    state: Set<string>
    country: Set<string>
  }>({
    zip: new Set(),
    city: new Set(),
    state: new Set(),
    country: new Set(),
  })

  const { results, loading, totalCount, actionInProgress, fetchCarrierLookupResults, toggleFavorite } =
    useCarrierLookupResults()

  // Apply client-side address filtering
  const filteredResults = useMemo(() => {
    if (addressFilters.length === 0) return results

    return results.filter((carrier) => {
      // If no physical address, can't filter
      if (!carrier.physical_address) return false

      // Check if carrier matches all address filters
      return addressFilters.every((filter) => {
        const addressValue = carrier.physical_address[filter.field]
        if (!addressValue) return false

        // Case insensitive comparison
        return addressValue.toLowerCase().includes(filter.value.toLowerCase())
      })
    })
  }, [results, addressFilters])

  // Extract unique address values for dropdowns
  useEffect(() => {
    if (results.length > 0) {
      const zipValues = new Set<string>()
      const cityValues = new Set<string>()
      const stateValues = new Set<string>()
      const countryValues = new Set<string>()

      results.forEach((carrier) => {
        if (carrier.physical_address) {
          if (carrier.physical_address.zip) zipValues.add(carrier.physical_address.zip)
          if (carrier.physical_address.city) cityValues.add(carrier.physical_address.city)
          if (carrier.physical_address.state) stateValues.add(carrier.physical_address.state)
          if (carrier.physical_address.country) countryValues.add(carrier.physical_address.country)
        }
      })

      setUniqueAddressValues({
        zip: zipValues,
        city: cityValues,
        state: stateValues,
        country: countryValues,
      })
    }
  }, [results])

  // Update filters when page size changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      limit: Number.parseInt(pageSize),
      offset: 0,
    }))
    setCurrentPage(1)
  }, [pageSize])

  useEffect(() => {
    fetchCarrierLookupResults(filters)
  }, [filters, fetchCarrierLookupResults])

  const handleSearch = useCallback(() => {
    setFilters({ ...filters, searchTerm, offset: 0 })
    setCurrentPage(1)
  }, [filters, searchTerm])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch()
      }
    },
    [handleSearch],
  )

  const addAddressFilter = useCallback(() => {
    if (!addressFilterValue) return

    // Add new filter
    setAddressFilters((prev) => [...prev, { field: addressFilterField, value: addressFilterValue }])

    // Reset input
    setAddressFilterValue("")
  }, [addressFilterField, addressFilterValue])

  const removeAddressFilter = useCallback((index: number) => {
    setAddressFilters((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const formatAddress = useCallback((address: any) => {
    if (!address) return "N/A"

    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zip) parts.push(address.zip)
    if (address.country && address.country !== "US") parts.push(address.country)

    return parts.join(", ") || "N/A"
  }, [])

  const handleToggleFavorite = useCallback(
    async (id: string, currentValue: boolean | null) => {
      await toggleFavorite(id, !(currentValue === true))
    },
    [toggleFavorite],
  )

  const handleViewDetails = useCallback((carrier: CarrierLookupResult) => {
    setSelectedCarrierId(carrier.id)
    setIsDetailsDialogOpen(true)
  }, [])

  const handleCloseDetailsDialog = useCallback(() => {
    setIsDetailsDialogOpen(false)
    setSelectedCarrierId(null)
  }, [])

  const handleCarrierSaved = useCallback(() => {
    // Refresh the carrier list to show updated data
    fetchCarrierLookupResults(filters)
  }, [fetchCarrierLookupResults, filters])

  const loadNextPage = useCallback(() => {
    const limit = Number.parseInt(pageSize)
    const newOffset = currentPage * limit
    setFilters({ ...filters, offset: newOffset, limit })
    setCurrentPage(currentPage + 1)
  }, [filters, pageSize, currentPage])

  const loadPreviousPage = useCallback(() => {
    if (currentPage <= 1) return

    const limit = Number.parseInt(pageSize)
    const newOffset = (currentPage - 2) * limit
    setFilters({ ...filters, offset: newOffset, limit })
    setCurrentPage(currentPage - 1)
  }, [filters, pageSize, currentPage])

  const handlePageSizeChange = useCallback((value: string) => {
    setPageSize(value)
  }, [])

  const applyFilter = useCallback(
    (filterType: string, value: any) => {
      const newFilters = { ...filters, offset: 0 }
      const newActiveFilters = [...activeFilters]

      switch (filterType) {
        case "favorites":
          newFilters.isFavorite = true
          if (!newActiveFilters.includes("favorites")) {
            newActiveFilters.push("favorites")
          }
          break
        case "active":
          newFilters.operatingStatus = "ACTIVE"
          if (!newActiveFilters.includes("active")) {
            newActiveFilters.push("active")
          }
          break
        case "inactive":
          newFilters.operatingStatus = "INACTIVE"
          if (!newActiveFilters.includes("inactive")) {
            newActiveFilters.push("inactive")
          }
          break
        case "recent":
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          newFilters.startDate = thirtyDaysAgo.toISOString()
          if (!newActiveFilters.includes("recent")) {
            newActiveFilters.push("recent")
          }
          break
        case "last7days":
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          newFilters.startDate = sevenDaysAgo.toISOString()
          if (!newActiveFilters.includes("last7days")) {
            newActiveFilters.push("last7days")
          }
          break
        case "today":
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          newFilters.startDate = today.toISOString()
          if (!newActiveFilters.includes("today")) {
            newActiveFilters.push("today")
          }
          break
      }

      setFilters(newFilters)
      setActiveFilters(newActiveFilters)
      setCurrentPage(1)
    },
    [filters, activeFilters],
  )

  const clearFilter = useCallback(
    (filterType: string) => {
      const newFilters = { ...filters, offset: 0 }
      const newActiveFilters = activeFilters.filter((f) => f !== filterType)

      switch (filterType) {
        case "favorites":
          delete newFilters.isFavorite
          break
        case "active":
        case "inactive":
          delete newFilters.operatingStatus
          break
        case "recent":
        case "last7days":
        case "today":
          delete newFilters.startDate
          break
      }

      setFilters(newFilters)
      setActiveFilters(newActiveFilters)
      setCurrentPage(1)
    },
    [filters, activeFilters],
  )

  const clearAllFilters = useCallback(() => {
    setFilters({
      limit: Number.parseInt(pageSize),
      offset: 0,
      searchTerm: searchTerm || undefined,
    })
    setActiveFilters([])
    setAddressFilters([])
    setCurrentPage(1)
  }, [searchTerm, pageSize])

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }, [])

  // Calculate pagination information
  const startItem = filters.offset + 1
  const endItem = Math.min(filters.offset + filteredResults.length, totalCount)
  const totalPages = Math.ceil(totalCount / Number.parseInt(pageSize))
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Get filter badge label
  const getFilterLabel = useCallback((filter: string) => {
    switch (filter) {
      case "favorites":
        return "Favorites only"
      case "active":
        return "Active carriers"
      case "inactive":
        return "Inactive carriers"
      case "recent":
        return "Last 30 days"
      case "last7days":
        return "Last 7 days"
      case "today":
        return "Added today"
      default:
        return filter
    }
  }, [])

  // Get address field label
  const getAddressFieldLabel = useCallback((field: AddressFilter["field"]) => {
    switch (field) {
      case "zip":
        return "ZIP Code"
      case "city":
        return "City"
      case "state":
        return "State"
      case "street":
        return "Street"
      case "country":
        return "Country"
    }
  }, [])

  // Get suggestions based on selected field
  const getAddressSuggestions = useCallback(() => {
    if (addressFilterField === "street") return [] // No suggestions for street

    const values = Array.from(uniqueAddressValues[addressFilterField] || [])
    return values
      .filter((value) => value.toLowerCase().includes(addressFilterValue.toLowerCase()))
      .sort()
      .slice(0, 10) // Limit to 10 suggestions
  }, [addressFilterField, addressFilterValue, uniqueAddressValues])

  const suggestions = useMemo(() => getAddressSuggestions(), [getAddressSuggestions])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, DOT or MC number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            Search
          </Button>

          <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {(activeFilters.length > 0 || addressFilters.length > 0) && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilters.length + addressFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-4 border-b">
                <div className="font-medium">Filter Carriers</div>
                <div className="text-sm text-muted-foreground">Apply filters to narrow down results</div>
              </div>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <div className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address Filters
                  </div>
                  <div className="pl-6 space-y-3">
                    <div className="flex gap-2">
                      <Select
                        value={addressFilterField}
                        onValueChange={(value) => setAddressFilterField(value as AddressFilter["field"])}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="state">State</SelectItem>
                          <SelectItem value="city">City</SelectItem>
                          <SelectItem value="zip">ZIP Code</SelectItem>
                          <SelectItem value="street">Street</SelectItem>
                          <SelectItem value="country">Country</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="relative flex-1">
                        <Input
                          placeholder={`Enter ${getAddressFieldLabel(addressFilterField)}...`}
                          value={addressFilterValue}
                          onChange={(e) => setAddressFilterValue(e.target.value)}
                          className="flex-1"
                        />
                        {addressFilterValue && suggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                            {suggestions.map((suggestion, i) => (
                              <div
                                key={i}
                                className="px-3 py-2 cursor-pointer hover:bg-muted"
                                onClick={() => {
                                  setAddressFilterValue(suggestion)
                                }}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button size="sm" onClick={addAddressFilter} disabled={!addressFilterValue}>
                        Add
                      </Button>
                    </div>

                    {addressFilters.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <div className="text-sm font-medium">Active address filters:</div>
                        <div className="flex flex-wrap gap-2">
                          {addressFilters.map((filter, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {getAddressFieldLabel(filter.field)}: {filter.value}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => removeAddressFilter(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Favorites
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites-filter"
                        checked={activeFilters.includes("favorites")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            applyFilter("favorites", true)
                          } else {
                            clearFilter("favorites")
                          }
                        }}
                      />
                      <Label htmlFor="favorites-filter">Show favorites only</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium mb-2 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Status
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active-filter"
                        checked={activeFilters.includes("active")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Clear inactive if active is selected
                            if (activeFilters.includes("inactive")) {
                              clearFilter("inactive")
                            }
                            applyFilter("active", "ACTIVE")
                          } else {
                            clearFilter("active")
                          }
                        }}
                      />
                      <Label htmlFor="active-filter">Active carriers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inactive-filter"
                        checked={activeFilters.includes("inactive")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Clear active if inactive is selected
                            if (activeFilters.includes("active")) {
                              clearFilter("active")
                            }
                            applyFilter("inactive", "INACTIVE")
                          } else {
                            clearFilter("inactive")
                          }
                        }}
                      />
                      <Label htmlFor="inactive-filter">Inactive carriers</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Added
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="today-filter"
                        checked={activeFilters.includes("today")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Clear other date filters
                            if (activeFilters.includes("recent")) clearFilter("recent")
                            if (activeFilters.includes("last7days")) clearFilter("last7days")
                            applyFilter("today", true)
                          } else {
                            clearFilter("today")
                          }
                        }}
                      />
                      <Label htmlFor="today-filter">Added today</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="last7days-filter"
                        checked={activeFilters.includes("last7days")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Clear other date filters
                            if (activeFilters.includes("recent")) clearFilter("recent")
                            if (activeFilters.includes("today")) clearFilter("today")
                            applyFilter("last7days", true)
                          } else {
                            clearFilter("last7days")
                          }
                        }}
                      />
                      <Label htmlFor="last7days-filter">Last 7 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recent-filter"
                        checked={activeFilters.includes("recent")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Clear other date filters
                            if (activeFilters.includes("last7days")) clearFilter("last7days")
                            if (activeFilters.includes("today")) clearFilter("today")
                            applyFilter("recent", true)
                          } else {
                            clearFilter("recent")
                          }
                        }}
                      />
                      <Label htmlFor="recent-filter">Last 30 days</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-t bg-muted/50">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all
                </Button>
                <Button size="sm" onClick={() => setShowFilterPanel(false)}>
                  Apply filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 min-w-[130px]">
                <ListFilter className="h-4 w-4 mr-1" />
                {pageSize} per page
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2 border-b">
                <div className="font-medium">Results per page</div>
              </div>
              <div className="p-2">
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer ${pageSize === option.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    onClick={() => handlePageSizeChange(option.value)}
                  >
                    {option.label}
                    {pageSize === option.value && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {(activeFilters.length > 0 || addressFilters.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {getFilterLabel(filter)}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => clearFilter(filter)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {addressFilters.map((filter, index) => (
            <Badge key={`addr-${index}`} variant="secondary" className="flex items-center gap-1">
              {getAddressFieldLabel(filter.field)}: {filter.value}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeAddressFilter(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-7" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        {loading && filteredResults.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>DOT Number</TableHead>
                <TableHead>MC Number</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {results.length > 0 && addressFilters.length > 0
                      ? "No carriers match your address filters. Try adjusting your criteria."
                      : "No carriers found. Try adjusting your search criteria."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((carrier) => (
                  <TableRow key={carrier.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {carrier.legal_name || "N/A"}
                          {carrier.dba_name && (
                            <div className="text-xs text-muted-foreground">DBA: {carrier.dba_name}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{carrier.dot_number || "N/A"}</TableCell>
                    <TableCell>{carrier.mc_mx_ff_number || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatAddress(carrier.physical_address)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={carrier.operating_status === "ACTIVE" ? "default" : "outline"}>
                        {carrier.operating_status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {formatDate(carrier.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFavorite(carrier.id, carrier.is_favorite)}
                                disabled={actionInProgress === carrier.id}
                              >
                                {actionInProgress === carrier.id ? (
                                  <LoadingSpinner className="h-4 w-4" />
                                ) : (
                                  <Star
                                    className={`h-4 w-4 ${carrier.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                  />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{carrier.is_favorite ? "Remove from favorites" : "Add to favorites"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleViewDetails(carrier)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {addressFilters.length > 0
              ? `Showing ${filteredResults.length} of ${results.length} carriers (filtered from ${totalCount} total)`
              : `Showing ${startItem} to ${endItem} of ${totalCount} carriers`}
          </div>
          <Badge variant="outline" className="ml-2">
            {pageSize} per page
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadPreviousPage} disabled={loading || !hasPreviousPage} size="sm">
            Previous
          </Button>
          <div className="px-2 text-sm">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button variant="outline" onClick={loadNextPage} disabled={loading || !hasNextPage} size="sm">
            {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            Next
          </Button>
        </div>
      </div>

      <CarrierDetailsDialog
        carrierId={selectedCarrierId}
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        onSaved={handleCarrierSaved}
      />
    </div>
  )
}
