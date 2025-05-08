"use client"

import { LocationList } from "@/components/locations/location-list"
import { useLocations } from "@/hooks/use-locations"
import { LoadingSpinner } from "@/components/loading-spinner"
import { MapPin } from "lucide-react"

export default function LocationsPage() {
  const { locations, isLoading, error, addLocation, updateLocation, deleteLocation } = useLocations()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <MapPin className="h-8 w-8 mr-3 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
            <p className="text-muted-foreground mt-1">Manage pickup, delivery, and facility locations</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading locations..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <MapPin className="h-8 w-8 mr-3 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
            <p className="text-muted-foreground mt-1">Manage pickup, delivery, and facility locations</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <p className="text-red-500 font-medium">Error loading locations</p>
            <p className="text-muted-foreground mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <MapPin className="h-8 w-8 mr-3 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground mt-1">Manage pickup, delivery, and facility locations</p>
        </div>
      </div>

      <LocationList
        locations={locations}
        onAddLocation={addLocation}
        onUpdateLocation={updateLocation}
        onDeleteLocation={deleteLocation}
        isLoading={isLoading}
      />
    </div>
  )
}
