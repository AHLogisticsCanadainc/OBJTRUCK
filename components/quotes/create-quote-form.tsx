"use client"

import { useState, useEffect } from "react"
import type { NewQuote } from "@/types/quotes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClients } from "@/hooks/use-clients"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Canadian provinces with two-letter codes
const PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
]

// US states with two-letter codes
const STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
]

// Combined list for the dropdown
const REGIONS = [...PROVINCES, ...STATES].sort((a, b) => a.name.localeCompare(b.name))

// Helper function to format city name with proper capitalization
const formatCityName = (city: string): string => {
  if (!city) return ""

  return city
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// Helper function to format location with proper capitalization and comma
const formatLocation = (city?: string, regionCode?: string): string => {
  if (!city && !regionCode) return ""

  const formattedCity = formatCityName(city || "")

  // Return formatted location
  if (formattedCity && regionCode) {
    return `${formattedCity}, ${regionCode}`
  } else if (formattedCity) {
    return formattedCity
  } else if (regionCode) {
    return regionCode
  }

  return ""
}

interface CreateQuoteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (quote: NewQuote) => void
}

export function CreateQuoteForm({ open, onOpenChange, onSubmit }: CreateQuoteFormProps) {
  const { clients, isLoading, error: clientsError, refreshClients } = useClients()
  const [newQuote, setNewQuote] = useState<
    NewQuote & {
      originCity?: string
      originRegion?: string
      destinationCity?: string
      destinationRegion?: string
      formattedOriginCity?: string
      formattedDestinationCity?: string
    }
  >({
    reference: "",
    origin: "",
    destination: "",
    date: new Date().toISOString().split("T")[0],
    client_id: "",
    originCity: "",
    originRegion: "",
    destinationCity: "",
    destinationRegion: "",
    formattedOriginCity: "",
    formattedDestinationCity: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Format city names and update combined location fields when individual fields change
  useEffect(() => {
    const formattedOriginCity = formatCityName(newQuote.originCity || "")
    const formattedDestinationCity = formatCityName(newQuote.destinationCity || "")

    setNewQuote((prev) => ({
      ...prev,
      formattedOriginCity,
      formattedDestinationCity,
      origin: formatLocation(formattedOriginCity, prev.originRegion),
      destination: formatLocation(formattedDestinationCity, prev.destinationRegion),
    }))
  }, [newQuote.originCity, newQuote.originRegion, newQuote.destinationCity, newQuote.destinationRegion])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Validate required fields
      if (!newQuote.originCity || !newQuote.originRegion || !newQuote.destinationCity || !newQuote.destinationRegion) {
        setFormError("Origin and destination city and region are required")
        return
      }

      if (!newQuote.client_id) {
        setFormError("Please select a client")
        return
      }

      // Submit with existing client - only send the necessary fields to Supabase
      const quoteToSubmit = {
        reference: newQuote.reference,
        origin: newQuote.origin,
        destination: newQuote.destination,
        date: newQuote.date,
        client_id: newQuote.client_id,
      }

      onSubmit(quoteToSubmit)

      // Reset the form
      setNewQuote({
        reference: "",
        origin: "",
        destination: "",
        date: new Date().toISOString().split("T")[0],
        client_id: "",
        originCity: "",
        originRegion: "",
        destinationCity: "",
        destinationRegion: "",
        formattedOriginCity: "",
        formattedDestinationCity: "",
      })

      // Close the dialog
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error submitting quote:", errorMessage)
      setFormError(`Error creating quote: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClientSelect = (clientId: string) => {
    setNewQuote({
      ...newQuote,
      client_id: clientId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] w-[95vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
          <DialogDescription>
            Create a new quote with customer and route information. You can add pricing options after creating the
            quote.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="grid grid-cols-1 gap-6 py-4 px-1">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="text-lg font-medium mb-2">Quote Information</h3>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input id="reference" value="Auto-generated" disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Reference number will be automatically generated</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Quote Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newQuote.date}
                    onChange={(e) => setNewQuote({ ...newQuote, date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Customer Information</h3>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Select Client *</Label>
                  {isLoading ? (
                    <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Loading clients...</span>
                    </div>
                  ) : clientsError ? (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{clientsError}</AlertDescription>
                    </Alert>
                  ) : (
                    <Select value={newQuote.client_id || ""} onValueChange={handleClientSelect} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Route Information</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-base font-medium">Origin *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="originCity" className="text-sm text-muted-foreground">
                        City
                      </Label>
                      <Input
                        id="originCity"
                        value={newQuote.originCity || ""}
                        onChange={(e) => {
                          setNewQuote({
                            ...newQuote,
                            originCity: e.target.value,
                          })
                        }}
                        required
                        placeholder="Enter origin city"
                      />
                      {newQuote.formattedOriginCity && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Will be saved as: {newQuote.formattedOriginCity}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originRegion" className="text-sm text-muted-foreground">
                        Province/State
                      </Label>
                      <Select
                        value={newQuote.originRegion || ""}
                        onValueChange={(value) => {
                          setNewQuote({
                            ...newQuote,
                            originRegion: value,
                          })
                        }}
                      >
                        <SelectTrigger id="originRegion">
                          <SelectValue placeholder="Select province/state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select...</SelectItem>
                          {REGIONS.map((region) => (
                            <SelectItem key={region.code} value={region.code}>
                              {region.code} - {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newQuote.origin && (
                    <p className="text-sm mt-2">
                      <strong>Formatted Origin:</strong> {newQuote.origin}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium">Destination *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="destinationCity" className="text-sm text-muted-foreground">
                        City
                      </Label>
                      <Input
                        id="destinationCity"
                        value={newQuote.destinationCity || ""}
                        onChange={(e) => {
                          setNewQuote({
                            ...newQuote,
                            destinationCity: e.target.value,
                          })
                        }}
                        required
                        placeholder="Enter destination city"
                      />
                      {newQuote.formattedDestinationCity && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Will be saved as: {newQuote.formattedDestinationCity}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinationRegion" className="text-sm text-muted-foreground">
                        Province/State
                      </Label>
                      <Select
                        value={newQuote.destinationRegion || ""}
                        onValueChange={(value) => {
                          setNewQuote({
                            ...newQuote,
                            destinationRegion: value,
                          })
                        }}
                      >
                        <SelectTrigger id="destinationRegion">
                          <SelectValue placeholder="Select province/state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select...</SelectItem>
                          {REGIONS.map((region) => (
                            <SelectItem key={region.code} value={region.code}>
                              {region.code} - {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newQuote.destination && (
                    <p className="text-sm mt-2">
                      <strong>Formatted Destination:</strong> {newQuote.destination}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Quote"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
