"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { Location, LocationFormData, OperatingHours } from "@/types/location"
import { PROVINCES } from "@/components/tools/all-tax-calculator/constants"
import { Users } from "lucide-react"

interface LocationFormProps {
  onSubmit: (data: LocationFormData) => void
  initialData?: Location
  isLoading?: boolean
}

export function LocationForm({ onSubmit, initialData, isLoading = false }: LocationFormProps) {
  // Basic Information
  const [locationCode, setLocationCode] = useState(initialData?.locationCode || "")
  const [name, setName] = useState(initialData?.name || "")
  const [locationType, setLocationType] = useState(initialData?.locationType || "warehouse")
  const [isActive, setIsActive] = useState(initialData?.isActive !== false)

  // Address Information
  const [addressLine1, setAddressLine1] = useState(initialData?.addressLine1 || "")
  const [addressLine2, setAddressLine2] = useState(initialData?.addressLine2 || "")
  const [city, setCity] = useState(initialData?.city || "")
  const [stateProvince, setStateProvince] = useState(initialData?.stateProvince || "")
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || "")
  const [country, setCountry] = useState(initialData?.country || "USA")
  const [latitude, setLatitude] = useState<number | undefined>(initialData?.latitude)
  const [longitude, setLongitude] = useState<number | undefined>(initialData?.longitude)

  // Contact Information
  const [contactName, setContactName] = useState(initialData?.contactName || "")
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || "")
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || "")
  const [contactNotes, setContactNotes] = useState(initialData?.contactNotes || "")

  // Facility Information
  const [appointmentRequired, setAppointmentRequired] = useState(initialData?.appointmentRequired || false)
  const [dockCount, setDockCount] = useState<number | undefined>(initialData?.dockCount)
  const [hasForklift, setHasForklift] = useState(initialData?.hasForklift || false)
  const [hazmatCertified, setHazmatCertified] = useState(initialData?.hazmatCertified || false)
  const [temperatureControlled, setTemperatureControlled] = useState(initialData?.temperatureControlled || false)
  const [storageCapacity, setStorageCapacity] = useState<number | undefined>(initialData?.storageCapacity)
  const [maxWeightCapacity, setMaxWeightCapacity] = useState<number | undefined>(initialData?.maxWeightCapacity)
  const [customsFacility, setCustomsFacility] = useState(initialData?.customsFacility || false)

  // Additional Information
  const [specialInstructions, setSpecialInstructions] = useState(initialData?.specialInstructions || "")
  const [accessibilityNotes, setAccessibilityNotes] = useState(initialData?.accessibilityNotes || "")
  const [insuranceRequirements, setInsuranceRequirements] = useState(initialData?.insuranceRequirements || "")
  const [billingCode, setBillingCode] = useState(initialData?.billingCode || "")
  const [clientId, setClientId] = useState(initialData?.clientId || "")
  const [nameOfTheClient, setNameOfTheClient] = useState(initialData?.nameOfTheClient || "")
  const [wasItClientAdded, setWasItClientAdded] = useState(initialData?.wasItClientAdded || "")

  // Operating Hours (simplified for this form)
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(initialData?.operatingHours || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData: LocationFormData = {
      locationCode,
      name,
      locationType,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      stateProvince,
      postalCode,
      country,
      latitude,
      longitude,
      contactName: contactName || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      contactNotes: contactNotes || undefined,
      appointmentRequired,
      dockCount,
      hasForklift,
      hazmatCertified,
      temperatureControlled,
      storageCapacity,
      maxWeightCapacity,
      customsFacility,
      specialInstructions: specialInstructions || undefined,
      accessibilityNotes: accessibilityNotes || undefined,
      insuranceRequirements: insuranceRequirements || undefined,
      billingCode: billingCode || undefined,
      clientId: clientId || undefined,
      operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : undefined,
      isActive,
      wasItClientAdded: wasItClientAdded || undefined,
      nameOfTheClient: nameOfTheClient || undefined,
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="facility">Facility</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter location name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationCode">Location Code</Label>
              <Input
                id="locationCode"
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                placeholder="Auto-generated if left blank"
              />
              <p className="text-xs text-muted-foreground">Unique identifier for this location</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationType">Location Type*</Label>
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger id="locationType">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="distribution_center">Distribution Center</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing Facility</SelectItem>
                  <SelectItem value="retail">Retail Location</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="port">Port</SelectItem>
                  <SelectItem value="airport">Airport</SelectItem>
                  <SelectItem value="rail_yard">Rail Yard</SelectItem>
                  <SelectItem value="cross_dock">Cross Dock</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="isActive">Active Location</Label>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1*</Label>
            <Input
              id="addressLine1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Enter street address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Suite, unit, building, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City*</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateProvince">State/Province*</Label>
              <Select value={stateProvince} onValueChange={setStateProvince}>
                <SelectTrigger id="stateProvince">
                  <SelectValue placeholder="Select state/province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal/ZIP Code*</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal/ZIP code"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country*</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter country"
                required
              />
            </div>
          </div>

          {initialData?.wasItClientAdded && (
            <div className="col-span-2 mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-amber-600" />
                <h3 className="font-medium text-amber-700 dark:text-amber-400">Client Added Location</h3>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                This location was added by a client through their portal and cannot be edited.
              </p>
              {initialData?.nameOfTheClient && (
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  <span className="font-medium">Client:</span> {initialData.nameOfTheClient}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0000001"
                value={latitude || ""}
                onChange={(e) => setLatitude(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                placeholder="e.g., 40.7128"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0000001"
                value={longitude || ""}
                onChange={(e) => setLongitude(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter primary contact name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter contact email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter contact phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNotes">Contact Notes</Label>
            <Textarea
              id="contactNotes"
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              placeholder="Additional contact information or notes"
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Facility Information Tab */}
        <TabsContent value="facility" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="appointmentRequired"
                  checked={appointmentRequired}
                  onCheckedChange={setAppointmentRequired}
                />
                <Label htmlFor="appointmentRequired">Appointment Required</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dockCount">Number of Docks</Label>
              <Input
                id="dockCount"
                type="number"
                min="0"
                value={dockCount || ""}
                onChange={(e) => setDockCount(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                placeholder="Enter number of docks"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="hasForklift" checked={hasForklift} onCheckedChange={setHasForklift} />
                <Label htmlFor="hasForklift">Forklift Available</Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="hazmatCertified" checked={hazmatCertified} onCheckedChange={setHazmatCertified} />
                <Label htmlFor="hazmatCertified">Hazmat Certified</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="temperatureControlled"
                  checked={temperatureControlled}
                  onCheckedChange={setTemperatureControlled}
                />
                <Label htmlFor="temperatureControlled">Temperature Controlled</Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="customsFacility" checked={customsFacility} onCheckedChange={setCustomsFacility} />
                <Label htmlFor="customsFacility">Customs Facility</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storageCapacity">Storage Capacity (sq ft)</Label>
              <Input
                id="storageCapacity"
                type="number"
                min="0"
                value={storageCapacity || ""}
                onChange={(e) => setStorageCapacity(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                placeholder="Enter storage capacity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWeightCapacity">Max Weight Capacity (lbs)</Label>
              <Input
                id="maxWeightCapacity"
                type="number"
                min="0"
                value={maxWeightCapacity || ""}
                onChange={(e) => setMaxWeightCapacity(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                placeholder="Enter max weight capacity"
              />
            </div>
          </div>
        </TabsContent>

        {/* Additional Information Tab */}
        <TabsContent value="additional" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Special handling or delivery instructions"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibilityNotes">Accessibility Notes</Label>
            <Textarea
              id="accessibilityNotes"
              value={accessibilityNotes}
              onChange={(e) => setAccessibilityNotes(e.target.value)}
              placeholder="Notes about accessibility, restrictions, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceRequirements">Insurance Requirements</Label>
            <Textarea
              id="insuranceRequirements"
              value={insuranceRequirements}
              onChange={(e) => setInsuranceRequirements(e.target.value)}
              placeholder="Required insurance coverage details"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCode">Billing Code</Label>
              <Input
                id="billingCode"
                value={billingCode}
                onChange={(e) => setBillingCode(e.target.value)}
                placeholder="Enter billing code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter associated client ID"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameOfTheClient">Client Name</Label>
              <Input
                id="nameOfTheClient"
                value={nameOfTheClient}
                onChange={(e) => setNameOfTheClient(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wasItClientAdded">Added By Client</Label>
              <Select value={wasItClientAdded} onValueChange={setWasItClientAdded}>
                <SelectTrigger id="wasItClientAdded">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Location" : "Add Location"}
        </Button>
      </div>
    </form>
  )
}
