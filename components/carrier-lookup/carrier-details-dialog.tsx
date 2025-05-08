"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/database"
import { format } from "date-fns"
import type { CarrierLookupResult } from "@/hooks/use-carrier-lookup-results"
import { Truck, Star, Calendar, Phone, MapPin, Shield, FileText, Info, X, Plus, Route, Package } from "lucide-react"

interface CarrierDetailsDialogProps {
  carrierId: string | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

// Define the structure for lanes and equipment types
interface Lane {
  id: string
  origin: string
  destination: string
  notes?: string
}

type EquipmentType = string

export function CarrierDetailsDialog({ carrierId, isOpen, onClose, onSaved }: CarrierDetailsDialogProps) {
  const [carrier, setCarrier] = useState<CarrierLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<Partial<CarrierLookupResult>>({})
  const [lanes, setLanes] = useState<Lane[]>([])
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [newLane, setNewLane] = useState<Partial<Lane>>({ origin: "", destination: "", notes: "" })
  const [newEquipment, setNewEquipment] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    if (isOpen && carrierId) {
      fetchCarrierDetails(carrierId)
    } else {
      setCarrier(null)
      setFormData({})
      setLanes([])
      setEquipmentTypes([])
      setIsEditing(false)
    }
  }, [isOpen, carrierId])

  const fetchCarrierDetails = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("carrier_lookup_results").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      // Process the data to ensure all fields are properly formatted
      const processedData = {
        ...data,
        // Ensure boolean fields are actually booleans
        is_saved: data.is_saved === true,
        is_favorite: data.is_favorite === true,
        insurance_required: data.insurance_required === true,
        bipd_insurance_required: data.bipd_insurance_required === true,
        cargo_insurance_required: data.cargo_insurance_required === true,
        // Parse JSON fields if they're strings
        physical_address:
          typeof data.physical_address === "string" ? JSON.parse(data.physical_address) : data.physical_address,
        mailing_address:
          typeof data.mailing_address === "string" ? JSON.parse(data.mailing_address) : data.mailing_address,
        insurance_on_file:
          typeof data.insurance_on_file === "string" ? JSON.parse(data.insurance_on_file) : data.insurance_on_file,
        bipd_insurance_on_file:
          typeof data.bipd_insurance_on_file === "string"
            ? JSON.parse(data.bipd_insurance_on_file)
            : data.bipd_insurance_on_file,
        cargo_insurance_on_file:
          typeof data.cargo_insurance_on_file === "string"
            ? JSON.parse(data.cargo_insurance_on_file)
            : data.cargo_insurance_on_file,
      }

      // Parse lanes
      let parsedLanes: Lane[] = []
      if (data.lanes) {
        try {
          const lanesData = typeof data.lanes === "string" ? JSON.parse(data.lanes) : data.lanes
          parsedLanes = Array.isArray(lanesData) ? lanesData : []
        } catch (e) {
          console.error("Error parsing lanes:", e)
          parsedLanes = []
        }
      }

      // Parse equipment types - note the column name has a space
      let parsedEquipmentTypes: EquipmentType[] = []
      if (data["equipment types"]) {
        try {
          const equipmentData =
            typeof data["equipment types"] === "string" ? JSON.parse(data["equipment types"]) : data["equipment types"]
          parsedEquipmentTypes = Array.isArray(equipmentData) ? equipmentData : []
        } catch (e) {
          console.error("Error parsing equipment types:", e)
          parsedEquipmentTypes = []
        }
      }

      setCarrier(processedData)
      setFormData(processedData)
      setLanes(parsedLanes)
      setEquipmentTypes(parsedEquipmentTypes)
    } catch (error) {
      console.error("Error fetching carrier details:", error)
      toast({
        title: "Error",
        description: "Failed to load carrier details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddLane = () => {
    if (!newLane.origin || !newLane.destination) {
      toast({
        title: "Error",
        description: "Origin and destination are required",
        variant: "destructive",
      })
      return
    }

    const lane: Lane = {
      id: crypto.randomUUID(),
      origin: newLane.origin,
      destination: newLane.destination,
      notes: newLane.notes || "",
    }

    setLanes([...lanes, lane])
    setNewLane({ origin: "", destination: "", notes: "" })
  }

  const handleRemoveLane = (id: string) => {
    setLanes(lanes.filter((lane) => lane.id !== id))
  }

  const handleAddEquipment = () => {
    if (!newEquipment.trim()) {
      toast({
        title: "Error",
        description: "Equipment type cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (equipmentTypes.includes(newEquipment.trim())) {
      toast({
        title: "Error",
        description: "This equipment type already exists",
        variant: "destructive",
      })
      return
    }

    setEquipmentTypes([...equipmentTypes, newEquipment.trim()])
    setNewEquipment("")
  }

  const handleRemoveEquipment = (equipment: string) => {
    setEquipmentTypes(equipmentTypes.filter((eq) => eq !== equipment))
  }

  const handleSave = async () => {
    if (!carrierId) return

    try {
      setSaving(true)

      // Prepare data for update
      const updateData = {
        ...formData,
        lanes: lanes.length > 0 ? lanes : null,
        // Use the correct column name with a space
        "equipment types": equipmentTypes.length > 0 ? equipmentTypes : null,
        updated_at: new Date().toISOString(),
      }

      // Remove read-only fields
      delete updateData.id
      delete updateData.created_at
      delete updateData.lookup_date
      delete updateData.raw_response

      const { error } = await supabase.from("carrier_lookup_results").update(updateData).eq("id", carrierId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Carrier information updated successfully",
      })

      // Refresh carrier details
      await fetchCarrierDetails(carrierId)
      setIsEditing(false)
      onSaved()
    } catch (error) {
      console.error("Error updating carrier:", error)
      toast({
        title: "Error",
        description: "Failed to update carrier information",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatAddress = (address: any) => {
    if (!address) return "N/A"

    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zipCode) parts.push(address.zipCode)

    return parts.join(", ") || "N/A"
  }

  const renderReadOnlyView = () => {
    if (!carrier) return null

    return (
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{carrier.legal_name || "Unnamed Carrier"}</h2>
              {carrier.dba_name && <p className="text-lg text-muted-foreground">DBA: {carrier.dba_name}</p>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Badge
              className="text-base px-3 py-1"
              variant={carrier.operating_status === "ACTIVE" ? "default" : "outline"}
            >
              {carrier.operating_status || "Unknown Status"}
            </Badge>
            {carrier.is_favorite && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                <Star className="h-4 w-4 mr-1 fill-current" /> Favorite
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
                activeTab === "basic"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
                activeTab === "contact"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Contact & Address
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
                activeTab === "safety"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Safety Information
            </button>
            <button
              onClick={() => setActiveTab("lanes")}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
                activeTab === "lanes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Lanes & Equipment
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Basic Information
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">DOT Number:</span>
                    <span className="font-semibold">{carrier.dot_number || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">MC Number:</span>
                    <span className="font-semibold">{carrier.mc_mx_ff_number || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Entity Type:</span>
                    <span>{carrier.entity_type || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Operation:</span>
                    <span>{carrier.carrier_operation || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> System Information
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Added:</span>
                    <span>{formatDate(carrier.created_at)}</span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Updated:</span>
                    <span>{formatDate(carrier.updated_at)}</span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Data Source:</span>
                    <span>{carrier.data_source || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" /> Fleet Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Fleet Size</span>
                    <p className="text-2xl font-semibold">{carrier.fleet_size || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Driver Count</span>
                    <p className="text-2xl font-semibold">{carrier.driver_count || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" /> Contact Information
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Phone:</span>
                    <span>{carrier.phone || "No phone number"}</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <span>{carrier.email || "No email address"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Address Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-medium mb-1">Physical Address</h4>
                    <p className="text-base">{formatAddress(carrier.physical_address)}</p>
                  </div>

                  {carrier.mailing_address && (
                    <div>
                      <h4 className="text-base font-medium mb-1">Mailing Address</h4>
                      <p className="text-base">{formatAddress(carrier.mailing_address)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Safety Information Tab */}
          {activeTab === "safety" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Safety Information
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Safety Rating:</span>
                    <span>{carrier.safety_rating || "N/A"}</span>
                  </div>

                  {carrier.out_of_service_date && (
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="font-medium text-muted-foreground">Out of Service:</span>
                      <span>{formatDate(carrier.out_of_service_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {carrier.notes && (
                <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Notes
                  </h3>
                  <div className="p-4 bg-background rounded-md whitespace-pre-wrap text-base">{carrier.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Lanes & Equipment Tab */}
          {activeTab === "lanes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary" /> Lanes
                </h3>

                {lanes.length > 0 ? (
                  <div className="space-y-3">
                    {lanes.map((lane) => (
                      <div key={lane.id} className="p-3 bg-background rounded-md">
                        <div className="font-medium text-base">
                          {lane.origin} → {lane.destination}
                        </div>
                        {lane.notes && <div className="text-sm text-muted-foreground mt-1">{lane.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-base text-muted-foreground p-3 bg-background rounded-md">No lanes specified</div>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Equipment Types
                </h3>

                {equipmentTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {equipmentTypes.map((equipment) => (
                      <Badge key={equipment} variant="secondary" className="text-base px-3 py-1">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-base text-muted-foreground p-3 bg-background rounded-md">
                    No equipment types specified
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderEditForm = () => {
    if (!formData) return null

    return (
      <div className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="basic" className="text-base py-3">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-base py-3">
              Contact & Address
            </TabsTrigger>
            <TabsTrigger value="lanes" className="text-base py-3">
              Lanes & Equipment
            </TabsTrigger>
            <TabsTrigger value="additional" className="text-base py-3">
              Additional Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="legal_name" className="text-base">
                  Legal Name
                </Label>
                <Input
                  id="legal_name"
                  name="legal_name"
                  value={formData.legal_name || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="dba_name" className="text-base">
                  DBA Name
                </Label>
                <Input
                  id="dba_name"
                  name="dba_name"
                  value={formData.dba_name || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="dot_number" className="text-base">
                  DOT Number
                </Label>
                <Input
                  id="dot_number"
                  name="dot_number"
                  value={formData.dot_number || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="mc_mx_ff_number" className="text-base">
                  MC Number
                </Label>
                <Input
                  id="mc_mx_ff_number"
                  name="mc_mx_ff_number"
                  value={formData.mc_mx_ff_number || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="entity_type" className="text-base">
                  Entity Type
                </Label>
                <Input
                  id="entity_type"
                  name="entity_type"
                  value={formData.entity_type || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="operating_status" className="text-base">
                Operating Status
              </Label>
              <Input
                id="operating_status"
                name="operating_status"
                value={formData.operating_status || ""}
                onChange={handleInputChange}
                className="text-base py-6"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="carrier_operation" className="text-base">
                Carrier Operation
              </Label>
              <Input
                id="carrier_operation"
                name="carrier_operation"
                value={formData.carrier_operation || ""}
                onChange={handleInputChange}
                className="text-base py-6"
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Switch
                id="is_favorite"
                checked={formData.is_favorite || false}
                onCheckedChange={(checked) => handleSwitchChange("is_favorite", checked)}
                className="scale-125"
              />
              <Label htmlFor="is_favorite" className="text-base font-medium">
                Mark as Favorite
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Physical Address</Label>
              <Textarea
                name="physical_address_text"
                value={formData.physical_address ? formatAddress(formData.physical_address) : ""}
                onChange={(e) => {
                  // This is a simplified approach - in a real app, you'd want to parse this into a proper address object
                  setFormData((prev) => ({
                    ...prev,
                    physical_address: { text: e.target.value },
                  }))
                }}
                placeholder="Enter physical address"
                rows={3}
                className="text-base p-4"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Mailing Address</Label>
              <Textarea
                name="mailing_address_text"
                value={formData.mailing_address ? formatAddress(formData.mailing_address) : ""}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    mailing_address: { text: e.target.value },
                  }))
                }}
                placeholder="Enter mailing address"
                rows={3}
                className="text-base p-4"
              />
            </div>
          </TabsContent>

          <TabsContent value="lanes" className="space-y-8">
            {/* Lanes Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Lanes</h3>
              </div>

              {lanes.length > 0 && (
                <div className="space-y-3">
                  {lanes.map((lane) => (
                    <div key={lane.id} className="flex items-center justify-between p-4 bg-muted rounded-md">
                      <div>
                        <div className="font-medium text-lg">
                          {lane.origin} → {lane.destination}
                        </div>
                        {lane.notes && <div className="text-base text-muted-foreground mt-1">{lane.notes}</div>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLane(lane.id)}
                        aria-label="Remove lane"
                        className="h-10 w-10"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 p-5 border rounded-md bg-muted/30">
                <h4 className="text-lg font-medium">Add New Lane</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lane-origin" className="text-base">
                      Origin
                    </Label>
                    <Input
                      id="lane-origin"
                      value={newLane.origin}
                      onChange={(e) => setNewLane({ ...newLane, origin: e.target.value })}
                      placeholder="City, State or Region"
                      className="text-base py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lane-destination" className="text-base">
                      Destination
                    </Label>
                    <Input
                      id="lane-destination"
                      value={newLane.destination}
                      onChange={(e) => setNewLane({ ...newLane, destination: e.target.value })}
                      placeholder="City, State or Region"
                      className="text-base py-6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lane-notes" className="text-base">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="lane-notes"
                    value={newLane.notes || ""}
                    onChange={(e) => setNewLane({ ...newLane, notes: e.target.value })}
                    placeholder="Additional information about this lane"
                    rows={3}
                    className="text-base p-4"
                  />
                </div>
                <Button onClick={handleAddLane} className="w-full py-6 text-base mt-2" size="lg">
                  <Plus className="h-5 w-5 mr-2" /> Add Lane
                </Button>
              </div>
            </div>

            {/* Equipment Types Section */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Equipment Types</h3>
              </div>

              {equipmentTypes.length > 0 && (
                <div className="flex flex-wrap gap-3 p-4 bg-muted rounded-md">
                  {equipmentTypes.map((equipment) => (
                    <Badge key={equipment} variant="secondary" className="flex items-center gap-2 text-base px-4 py-2">
                      {equipment}
                      <button
                        onClick={() => handleRemoveEquipment(equipment)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${equipment}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-center">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Enter equipment type (e.g., Flatbed, Reefer)"
                  className="flex-1 text-base py-6"
                />
                <Button onClick={handleAddEquipment} size="lg" className="py-6 px-6">
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="fleet_size" className="text-base">
                  Fleet Size
                </Label>
                <Input
                  id="fleet_size"
                  name="fleet_size"
                  type="number"
                  value={formData.fleet_size || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="driver_count" className="text-base">
                  Driver Count
                </Label>
                <Input
                  id="driver_count"
                  name="driver_count"
                  type="number"
                  value={formData.driver_count || ""}
                  onChange={handleInputChange}
                  className="text-base py-6"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="safety_rating" className="text-base">
                Safety Rating
              </Label>
              <Input
                id="safety_rating"
                name="safety_rating"
                value={formData.safety_rating || ""}
                onChange={handleInputChange}
                className="text-base py-6"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={6}
                className="text-base p-4"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 rounded-none">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-8 py-4 border-b flex-shrink-0">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold">Carrier Details</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-8">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner size={48} />
              </div>
            ) : (
              <>{isEditing ? renderEditForm() : renderReadOnlyView()}</>
            )}
          </div>

          <DialogFooter className="px-8 py-4 border-t flex-shrink-0">
            <div className="flex justify-between w-full">
              <div>
                {isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    size="lg"
                    className="text-base px-6 py-6"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button variant="outline" onClick={onClose} size="lg" className="text-base px-6 py-6">
                    Close
                  </Button>
                )}
              </div>
              <div>
                {isEditing ? (
                  <Button onClick={handleSave} disabled={saving} size="lg" className="text-base px-8 py-6">
                    {saving ? <LoadingSpinner className="mr-2 h-5 w-5" /> : null}
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)} size="lg" className="text-base px-6 py-6">
                    Edit Carrier
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
