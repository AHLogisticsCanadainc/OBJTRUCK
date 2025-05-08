"use client"

import { useState, useEffect } from "react"
import { getCarriers } from "@/lib/carrier-service"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CarrierCard } from "./carrier-card"
import { CarriersTable } from "./carriers-table"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { Search, Plus, RefreshCw, List, Grid } from "lucide-react"
import type { Carrier, CarrierFilters } from "@/types/carrier-types"

export function CarrierList() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadCarriers()
  }, [showActiveOnly])

  const loadCarriers = async (filters?: CarrierFilters) => {
    try {
      setLoading(true)
      const data = await getCarriers({
        ...filters,
        active: showActiveOnly ? true : undefined,
      })
      setCarriers(data)
    } catch (error) {
      console.error("Failed to load carriers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    await loadCarriers({ searchTerm, active: showActiveOnly ? true : undefined })
  }

  const handleRefresh = () => {
    loadCarriers({ active: showActiveOnly ? true : undefined })
  }

  const handleAddNew = () => {
    router.push("/dashboard/carriers/new")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Carriers</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddNew} variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
              <Button onClick={() => setShowActiveOnly(!showActiveOnly)} variant="outline" size="sm">
                {showActiveOnly ? "Show All" : "Show Active Only"}
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="flex">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name, MC# or USDOT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          ) : carriers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No carriers found. Try adjusting your search or add a new carrier.
            </div>
          ) : viewMode === "table" ? (
            <CarriersTable carriers={carriers} onRefresh={handleRefresh} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carriers.map((carrier) => (
                <CarrierCard key={carrier.id} carrier={carrier} onRefresh={handleRefresh} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
