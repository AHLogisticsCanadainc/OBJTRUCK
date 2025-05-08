"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, ListIcon, Search, Plus, FileDown, MapPin, Building } from "lucide-react"
import { LocationCard } from "./location-card"
import { LocationTable } from "./location-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationForm } from "./location-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Location, LocationFormData } from "@/types/location"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { exportLocationsToCSV } from "@/lib/location-export"

interface LocationListProps {
  locations: Location[]
  onAddLocation: (data: LocationFormData) => Promise<void>
  onUpdateLocation: (id: string, data: LocationFormData) => Promise<void>
  onDeleteLocation: (id: string) => Promise<void>
  isLoading?: boolean
}

export function LocationList({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  isLoading = false,
}: LocationListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterState, setFilterState] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">("locationViewMode", "list")

  // Get unique states from locations
  const states = [...new Set(locations.map((loc) => loc.stateProvince))].sort()

  // Get unique location types from locations
  const locationTypes = [...new Set(locations.map((loc) => loc.locationType))].sort()

  // Filter and search locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.addressLine1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.stateProvince.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.postalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.locationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.contactName && location.contactName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTypeFilter = filterType === "all" || location.locationType === filterType
    const matchesStateFilter = filterState === "all" || location.stateProvince === filterState

    return matchesSearch && matchesTypeFilter && matchesStateFilter
  })

  const handleAddSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true)
    await onAddLocation(data)
    setIsSubmitting(false)
    setShowAddDialog(false)
  }

  const handleEditSubmit = async (data: LocationFormData) => {
    if (!editingLocation) return
    setIsSubmitting(true)
    await onUpdateLocation(editingLocation.id, data)
    setIsSubmitting(false)
    setEditingLocation(null)
  }

  const handleDelete = async () => {
    if (!deletingLocationId) return
    await onDeleteLocation(deletingLocationId)
    setDeletingLocationId(null)
  }

  // Handle export to CSV
  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    exportLocationsToCSV(filteredLocations, `locations-export-${timestamp}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {locationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by state" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleExport}>
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            title={viewMode === "list" ? "Switch to Grid View" : "Switch to List View"}
          >
            {viewMode === "list" ? <LayoutGrid className="h-4 w-4" /> : <ListIcon className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>
      </div>

      {filteredLocations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">No locations found</h3>
          <p className="text-muted-foreground mt-1">
            {locations.length === 0 ? "Add your first location to get started" : "Try adjusting your search or filters"}
          </p>
          {locations.length === 0 && (
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={(location) => setEditingLocation(location)}
              onDelete={(id) => setDeletingLocationId(id)}
            />
          ))}
        </div>
      ) : (
        <LocationTable
          locations={filteredLocations}
          onEdit={(location) => setEditingLocation(location)}
          onDelete={(id) => setDeletingLocationId(id)}
        />
      )}

      {/* Add Location Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <LocationForm onSubmit={handleAddSubmit} isLoading={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={!!editingLocation} onOpenChange={(open) => !open && setEditingLocation(null)}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          {editingLocation && (
            <LocationForm initialData={editingLocation} onSubmit={handleEditSubmit} isLoading={isSubmitting} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLocationId} onOpenChange={(open) => !open && setDeletingLocationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the location from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
