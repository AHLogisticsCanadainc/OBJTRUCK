"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Map, ExternalLink } from "lucide-react"
import type { Location } from "@/types/location"
import { getGoogleMapsUrl } from "@/lib/map-utils"

interface LocationTableProps {
  locations: Location[]
  onEdit: (location: Location) => void
  onDelete: (id: string) => void
}

export function LocationTable({ locations, onEdit, onDelete }: LocationTableProps) {
  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "warehouse":
        return "bg-blue-500 text-white dark:bg-blue-600 dark:text-white"
      case "distribution_center":
        return "bg-green-500 text-white dark:bg-green-600 dark:text-white"
      case "manufacturing":
        return "bg-purple-500 text-white dark:bg-purple-600 dark:text-white"
      case "retail":
        return "bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white"
      case "residential":
        return "bg-red-500 text-white dark:bg-red-600 dark:text-white"
      case "port":
      case "airport":
      case "rail_yard":
        return "bg-cyan-500 text-white dark:bg-cyan-600 dark:text-white"
      case "cross_dock":
        return "bg-orange-500 text-white dark:bg-orange-600 dark:text-white"
      default:
        return "bg-gray-500 text-white dark:bg-gray-600 dark:text-white"
    }
  }

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case "distribution_center":
        return "Distribution Center"
      default:
        return type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
    }
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead className="hidden lg:table-cell">Contact</TableHead>
            <TableHead className="hidden lg:table-cell">Features</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => {
            const mapsUrl = getGoogleMapsUrl(location)

            return (
              <TableRow key={location.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-muted-foreground">{location.locationCode}</div>
                    {location.wasItClientAdded && (
                      <Badge
                        variant="outline"
                        className="mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-300"
                      >
                        Client Added
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getLocationTypeColor(location.locationType)}>
                    {getLocationTypeLabel(location.locationType)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm">
                    <div>{location.addressLine1}</div>
                    {location.addressLine2 && <div>{location.addressLine2}</div>}
                    <div>
                      {location.city}, {location.stateProvince} {location.postalCode}
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center mt-1 text-xs"
                    >
                      <Map className="h-3 w-3 mr-1" />
                      View on Maps
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {location.contactName ? (
                    <div className="text-sm">
                      <div>{location.contactName}</div>
                      {location.contactPhone && <div className="text-xs">{location.contactPhone}</div>}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No contact</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {location.appointmentRequired && (
                      <Badge variant="outline" className="text-xs">
                        Appointment
                      </Badge>
                    )}
                    {location.hasForklift && (
                      <Badge variant="outline" className="text-xs">
                        Forklift
                      </Badge>
                    )}
                    {location.temperatureControlled && (
                      <Badge variant="outline" className="text-xs">
                        Temp Control
                      </Badge>
                    )}
                    {location.hazmatCertified && (
                      <Badge variant="outline" className="text-xs">
                        Hazmat
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(location)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDelete(location.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
