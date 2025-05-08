"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  Calendar,
  Truck,
  Thermometer,
  Package,
  AlertTriangle,
  Check,
  X,
  Building,
  Users,
  ExternalLink,
  Map,
} from "lucide-react"
import type { Location } from "@/types/location"
import { getGoogleMapsUrl } from "@/lib/map-utils"

interface LocationCardProps {
  location: Location
  onEdit: (location: Location) => void
  onDelete: (id: string) => void
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
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

  const mapsUrl = getGoogleMapsUrl(location)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{location.name}</CardTitle>
              {location.wasItClientAdded && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-300"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Client Added
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{location.locationCode}</p>
            {location.wasItClientAdded && location.nameOfTheClient && (
              <p className="text-xs text-amber-600 mt-1 flex items-center">
                <Building className="h-3 w-3 mr-1" />
                Added by: {location.nameOfTheClient}
              </p>
            )}
          </div>
          <Badge className={`${getLocationTypeColor(location.locationType)} font-medium`}>
            {getLocationTypeLabel(location.locationType)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-4">
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="text-sm">
            <p>{location.addressLine1}</p>
            {location.addressLine2 && <p>{location.addressLine2}</p>}
            <p>
              {location.city}, {location.stateProvince} {location.postalCode}
            </p>
            <p>{location.country}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 flex items-center mt-1 text-xs"
            >
              <Map className="h-3 w-3 mr-1" />
              View on Google Maps
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>

        {(location.contactName || location.contactEmail || location.contactPhone) && (
          <>
            <Separator className="my-2" />
            <div className="space-y-2">
              {location.contactName && (
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{location.contactName}</span>
                </div>
              )}
              {location.contactPhone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{location.contactPhone}</span>
                </div>
              )}
              {location.contactEmail && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{location.contactEmail}</span>
                </div>
              )}
            </div>
          </>
        )}

        <Separator className="my-2" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              Appointment:{" "}
              {location.appointmentRequired ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
            </span>
          </div>

          {location.dockCount !== undefined && (
            <div className="flex items-center space-x-1">
              <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Docks: {location.dockCount}</span>
            </div>
          )}

          {location.hasForklift !== undefined && (
            <div className="flex items-center space-x-1">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Forklift:{" "}
                {location.hasForklift ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500" />
                )}
              </span>
            </div>
          )}

          {location.temperatureControlled !== undefined && (
            <div className="flex items-center space-x-1">
              <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Temp Control:{" "}
                {location.temperatureControlled ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500" />
                )}
              </span>
            </div>
          )}

          {location.hazmatCertified !== undefined && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Hazmat:{" "}
                {location.hazmatCertified ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500" />
                )}
              </span>
            </div>
          )}
        </div>

        {location.specialInstructions && (
          <div className="mt-3 text-sm">
            <p className="font-medium text-xs">Special Instructions:</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{location.specialInstructions}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onEdit(location)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={() => onDelete(location.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
