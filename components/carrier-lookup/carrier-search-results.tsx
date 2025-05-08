"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Truck,
  MapPin,
  ChevronRight,
  Filter,
  X,
  Plus,
  Check,
  AlertCircle,
  Database,
  Search,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { CarrierDetailsView } from "./carrier-details-view"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { getStatesByCountry } from "@/lib/states-provinces"
import { useCarrierLookup } from "@/hooks/use-carrier-lookup"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CarrierSearchResultsProps {
  data: any
}

// Number of results to show per page
const RESULTS_PER_PAGE = 20

export function CarrierSearchResults({ data }: CarrierSearchResultsProps) {
  const router = useRouter()
  const [selectedCarrier, setSelectedCarrier] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const {
    isSaving,
    isSaved,
    saveError,
    processingProgress,
    totalToProcess,
    existingCarriers,
    isCheckingExisting,
    fetchDocketNumbers,
    apiKey,
  } = useCarrierLookup()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Filter states
  const [stateFilter, setStateFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [minPowerUnits, setMinPowerUnits] = useState<string>("")
  const [operationFilter, setOperationFilter] = useState<string>("")
  const [nameFilter, setNameFilter] = useState<string>("")

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (totalToProcess === 0) return 0
    return Math.round((processingProgress / totalToProcess) * 100)
  }, [processingProgress, totalToProcess])

  // Log data on mount to help with debugging
  useEffect(() => {
    if (data?.content) {
      console.log("Carrier data received:", data)
      if (Array.isArray(data.content) && data.content.length > 0) {
        console.log("First carrier sample:", data.content[0])
        if (data.content[0].carrier?.cargoCarried) {
          console.log("Cargo carried sample:", data.content[0].carrier.cargoCarried)
        }
      }
    }
  }, [data])

  const statesByCountry = useMemo(() => getStatesByCountry(), [])

  const uniqueOperations = useMemo(() => {
    const operations = new Set<string>()
    if (data?.content) {
      data.content.forEach((item: any) => {
        if (item.carrier.carrierOperation?.carrierOperationDesc) {
          operations.add(item.carrier.carrierOperation.carrierOperationDesc)
        }
      })
    }
    return Array.from(operations).sort()
  }, [data?.content])

  const initialCarriers = useMemo(() => data?.content || [], [data?.content])

  const filteredCarriers = useMemo(() => {
    return initialCarriers.filter((item: any) => {
      const carrier = item.carrier

      // Name filter (case insensitive)
      if (nameFilter && nameFilter.trim() !== "") {
        const legalName = carrier.legalName?.toLowerCase() || ""
        const dbaName = carrier.dbaName?.toLowerCase() || ""
        const searchTerm = nameFilter.toLowerCase()

        if (!legalName.includes(searchTerm) && !dbaName.includes(searchTerm)) {
          return false
        }
      }

      // State/Province filter
      if (stateFilter && stateFilter !== "ALL" && carrier.phyState !== stateFilter) {
        return false
      }

      // Status filter
      if (statusFilter && statusFilter !== "ALL" && carrier.statusCode !== statusFilter) {
        return false
      }

      // Power Units filter
      if (minPowerUnits && carrier.totalPowerUnits) {
        const powerUnits = Number.parseInt(carrier.totalPowerUnits)
        if (isNaN(powerUnits) || powerUnits < Number.parseInt(minPowerUnits)) {
          return false
        }
      }

      // Operation filter
      if (
        operationFilter &&
        operationFilter !== "ALL" &&
        carrier.carrierOperation?.carrierOperationDesc !== operationFilter
      ) {
        return false
      }

      return true
    })
  }, [initialCarriers, stateFilter, statusFilter, minPowerUnits, operationFilter, nameFilter])

  // Paginated carriers
  const paginatedCarriers = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE
    const endIndex = startIndex + RESULTS_PER_PAGE
    return filteredCarriers.slice(startIndex, endIndex)
  }, [filteredCarriers, currentPage])

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCarriers.length / RESULTS_PER_PAGE)
  }, [filteredCarriers])

  // Function to handle adding carrier to company list
  const handleAddToCompanyList = async (carrier: any, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering the parent onClick that shows details

    const dotNumber = carrier.dotNumber?.toString()

    // Fetch the docket number (MC number) for this carrier only if we have both API key and DOT number
    let mcNumber = null
    if (dotNumber && apiKey) {
      try {
        console.log(`Fetching docket number for DOT# ${dotNumber} before adding to company list`)
        mcNumber = await fetchDocketNumbers(dotNumber)
        console.log(`Fetched MC number for DOT# ${dotNumber}: ${mcNumber || "None found"}`)
      } catch (err) {
        console.error(`Error fetching docket number for DOT# ${dotNumber}:`, err)
        // Continue with the process even if docket number fetch fails
      }
    } else {
      console.log(`Skipping docket number fetch: DOT# ${dotNumber || "unknown"} (API key available: ${!!apiKey})`)
    }

    // Prepare carrier data for the form
    const carrierData = {
      company_name: carrier.legalName || "",
      dba_name: carrier.dbaName || "",
      mc_number: mcNumber || carrier.mcNumber || "", // Use fetched MC number or fallback
      usdot: dotNumber || "",
      address_street: carrier.phyStreet || "",
      address_city: carrier.phyCity || "",
      address_state_or_province: carrier.phyState || "",
      address_zip_or_postal: carrier.phyZipcode || "",
      email: carrier.email || "",
      tractor_units: carrier.totalPowerUnits?.toString() || "",
      active: carrier.statusCode === "A",
      source: "FMCSA Lookup",
    }

    console.log(`Adding carrier to company list. DOT: ${carrierData.usdot}, MC/Docket: ${carrierData.mc_number}`)

    // Encode the data to pass via URL
    const encodedData = encodeURIComponent(JSON.stringify(carrierData))
    router.push(`/dashboard/carriers/new?prefill=${encodedData}`)
  }

  // Check if a carrier is already in the database
  const isCarrierInDatabase = (dotNumber: string) => {
    return existingCarriers[dotNumber] === true
  }

  const showDetailsDirectly = data?.content?.length === 1
  const isCarrierSelected = !!selectedCarrier

  // Early return if no data
  if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-md">
        <p className="text-center text-muted-foreground">No carrier data available to display</p>
      </div>
    )
  }

  // If only one result, show it directly
  if (showDetailsDirectly) {
    return (
      <div className="space-y-4">
        <CarrierDetailsView data={data} />
        <div className="flex justify-center">
          <Button
            onClick={(e) => handleAddToCompanyList(data.content[0].carrier, e)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add to Company List
          </Button>
        </div>
      </div>
    )
  }

  // If a carrier is selected, show its details
  if (isCarrierSelected) {
    // Create a new data object with the selected carrier as the only item
    const carrierData = {
      content: [selectedCarrier],
      retrievalDate: data.retrievalDate,
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setSelectedCarrier(null)} className="mb-2">
            Back to Search Results
          </Button>
          <Button
            onClick={(e) => handleAddToCompanyList(selectedCarrier.carrier, e)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add to Company List
          </Button>
        </div>
        <CarrierDetailsView data={carrierData} />
      </div>
    )
  }

  // Count active filters
  const activeFilterCount = [
    nameFilter,
    stateFilter && stateFilter !== "ALL",
    statusFilter && statusFilter !== "ALL",
    minPowerUnits,
    operationFilter && operationFilter !== "ALL",
  ].filter(Boolean).length

  // Reset all filters
  const resetFilters = () => {
    setNameFilter("")
    setStateFilter("")
    setStatusFilter("")
    setMinPowerUnits("")
    setOperationFilter("")
    setCurrentPage(1)
  }

  // Otherwise, show the list of carriers with filters
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Carrier Search Results ({filteredCarriers.length} of {initialCarriers.length})
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="flex items-center gap-1">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Saving status indicators */}
          {isSaving && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Saving carriers to database...</span>
                <span className="text-sm font-medium">
                  {processingProgress} of {totalToProcess}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {isSaved && !isSaving && (
            <div className="flex items-center gap-1 text-sm font-normal text-green-600">
              <Check className="h-4 w-4" />
              <span>All carriers saved successfully</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-1 text-sm font-normal text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Error: {saveError}</span>
            </div>
          )}

          {isCheckingExisting && (
            <div className="flex items-center gap-1 text-sm font-normal">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Checking database for existing carriers...</span>
            </div>
          )}
        </div>
      </CardHeader>

      {showFilters && (
        <div className="px-6 pb-4">
          <div className="mb-4">
            <Label htmlFor="name-filter">Search within results</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name-filter"
                placeholder="Filter by company name"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value)
                  setCurrentPage(1) // Reset to first page when filtering
                }}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="state-filter">State/Province</Label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger id="state-filter">
                  <SelectValue placeholder="All States/Provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All States/Provinces</SelectItem>

                  {/* US States */}
                  <SelectGroup>
                    <SelectLabel>United States</SelectLabel>
                    {statesByCountry["US"]?.map((state) => (
                      <SelectItem key={`US-${state.code}`} value={state.code}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  {/* Canadian Provinces */}
                  <SelectGroup>
                    <SelectLabel>Canada</SelectLabel>
                    {statesByCountry["CA"]?.map((province) => (
                      <SelectItem key={`CA-${province.code}`} value={province.code}>
                        {province.code} - {province.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  {/* Mexican States */}
                  <SelectGroup>
                    <SelectLabel>Mexico</SelectLabel>
                    {statesByCountry["MX"]?.map((state) => (
                      <SelectItem key={`MX-${state.code}`} value={state.code}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="A">Active</SelectItem>
                  <SelectItem value="I">Inactive</SelectItem>
                  <SelectItem value="P">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="power-units-filter">Min Power Units</Label>
              <Input
                id="power-units-filter"
                type="number"
                min="0"
                value={minPowerUnits}
                onChange={(e) => setMinPowerUnits(e.target.value)}
                placeholder="Any"
              />
            </div>

            <div>
              <Label htmlFor="operation-filter">Operation Type</Label>
              <Select value={operationFilter} onValueChange={setOperationFilter}>
                <SelectTrigger id="operation-filter">
                  <SelectValue placeholder="All Operations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Operations</SelectItem>
                  <SelectItem value="Interstate">Interstate</SelectItem>
                  <SelectItem value="Intrastate Hazmat">Intrastate Hazmat</SelectItem>
                  <SelectItem value="Intrastate Non-Hazmat">Intrastate Non-Hazmat</SelectItem>
                  {uniqueOperations
                    .filter((op) => !["Interstate", "Intrastate Hazmat", "Intrastate Non-Hazmat"].includes(op))
                    .map((op) => (
                      <SelectItem key={op} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator className="my-4" />
        </div>
      )}

      <CardContent>
        {filteredCarriers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No carriers match the selected filters</p>
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedCarriers.map((item: any, index: number) => {
              const carrier = item.carrier
              const dotNumber = carrier.dotNumber?.toString()
              const isInDatabase = isCarrierInDatabase(dotNumber)

              return (
                <div
                  key={index}
                  className="border rounded-md p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCarrier(item)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{carrier.legalName}</h3>
                        <Badge variant={carrier.statusCode === "A" ? "success" : "destructive"}>
                          {carrier.statusCode === "A" ? "Active" : "Inactive"}
                        </Badge>

                        {/* Database status indicator */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                {isInDatabase ? (
                                  <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                                    <Database className="h-3 w-3" />
                                    <span>Saved</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Database className="h-3 w-3" />
                                    <span>New</span>
                                  </Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isInDatabase
                                ? "This carrier is already saved in your database"
                                : "This carrier will be saved to your database"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {carrier.dbaName && <p className="text-sm text-muted-foreground">DBA: {carrier.dbaName}</p>}
                      <div className="flex items-start gap-2 mt-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>
                            {carrier.phyCity}, {carrier.phyState} {carrier.phyZipcode}
                          </p>
                          <p>{carrier.phyCountry}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium">DOT# {carrier.dotNumber}</div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={(e) => handleAddToCompanyList(carrier, e)}
                        >
                          <Plus className="h-4 w-4" />
                          Add to Company List
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Drivers: </span>
                      <span>{carrier.totalDrivers || 0}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Power Units: </span>
                      <span>{carrier.totalPowerUnits || 0}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Operation: </span>
                      <span>{carrier.carrierOperation?.carrierOperationDesc || "N/A"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Authority: </span>
                      <span>
                        {carrier.commonAuthorityStatus === "A"
                          ? "Common"
                          : carrier.contractAuthorityStatus === "A"
                            ? "Contract"
                            : carrier.brokerAuthorityStatus === "A"
                              ? "Broker"
                              : "None"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <CardFooter className="flex justify-between items-center border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * RESULTS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * RESULTS_PER_PAGE, filteredCarriers.length)} of {filteredCarriers.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
