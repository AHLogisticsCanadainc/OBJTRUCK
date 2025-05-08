"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { getCarrierById, createCarrier, updateCarrier } from "@/lib/carrier-service"
import type { NewCarrier } from "@/types/carrier-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import React from "react"

interface CarrierFormProps {
  carrierId?: number
  isEditMode?: boolean
}

export function CarrierForm({ carrierId, isEditMode = false }: CarrierFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(carrierId ? true : false)
  const [saving, setSaving] = useState(false)
  const [isPrefilled, setIsPrefilled] = useState(false)

  const [formData, setFormData] = useState<NewCarrier>({
    company_name: "",
    email: null,
    mc_number: null,
    usdot: null,
    address_number: null,
    address_street: null,
    address_suite: null,
    address_city: null,
    address_state_or_province: null,
    address_zip_or_postal: null,
    yard_address_number: null,
    yard_address_street: null,
    yard_address_suite: null,
    yard_address_city: null,
    yard_address_state_or_province: null,
    yard_address_zip_or_postal: null,
    tractor_units: null,
    trailer_units: null,
    payment_terms: null,
    dba_name: null,
    dispatch_email: null,
    dispatch_email_contact_person: null,
    sales_email: null,
    owner_email: null,
    eta_email: null,
    safety_email: null,
    notes: null,
    main_contact_name: "",
    main_contact_phone: "",
    main_contact_email: "",
    source: null,
    active: true,
    carrier_portalactive: null,
    carrier_portalsignup_email: null,
    carrier_portal_activedate: null,
  })

  // Check for prefill data in URL - using a ref to prevent infinite loops
  const prefillProcessed = React.useRef(false)

  useEffect(() => {
    const prefillData = searchParams.get("prefill")

    // Only process prefill data once to prevent infinite loops
    if (prefillData && !prefillProcessed.current) {
      prefillProcessed.current = true

      try {
        const decodedData = JSON.parse(decodeURIComponent(prefillData))
        console.log("Prefill data:", decodedData)

        // Convert string values to appropriate types
        const processedData: Partial<NewCarrier> = {}

        // Process each field to ensure correct types
        Object.entries(decodedData).forEach(([key, value]) => {
          if (key === "usdot" || key === "mc_number" || key === "tractor_units" || key === "trailer_units") {
            // Convert numeric strings to numbers
            const numValue = value ? Number(value) : null
            processedData[key as keyof NewCarrier] = !isNaN(numValue as number) ? numValue : null
          } else if (key === "active") {
            // Boolean value
            processedData[key as keyof NewCarrier] = Boolean(value)
          } else {
            // String values
            processedData[key as keyof NewCarrier] = value || null
          }
        })

        // Update form data with processed values - do this once
        setFormData((prev) => ({
          ...prev,
          ...processedData,
          // Set source to FMCSA if not provided
          source: processedData.source || "FMCSA Lookup",
        }))

        setIsPrefilled(true)

        toast({
          title: "Form Pre-filled",
          description: "The form has been pre-filled with FMCSA data. Please review before saving.",
        })
      } catch (error) {
        console.error("Error parsing prefill data:", error)
        toast({
          title: "Error",
          description: "Failed to load pre-filled carrier data.",
          variant: "destructive",
        })
      }
    }
  }, [searchParams, toast])

  // Load carrier data if in edit mode
  useEffect(() => {
    if (carrierId) {
      const loadCarrier = async () => {
        try {
          const data = await getCarrierById(carrierId)
          setFormData(data)
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load carrier information.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
      loadCarrier()
    } else {
      setLoading(false)
    }
  }, [carrierId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : Number.parseInt(value, 10),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEditMode && carrierId) {
        // Update existing carrier
        await updateCarrier(carrierId, formData)
        toast({
          title: "Carrier Updated",
          description: "The carrier has been updated successfully.",
        })
      } else {
        // Create new carrier
        await createCarrier(formData)
        toast({
          title: "Carrier Created",
          description: "The carrier has been added successfully.",
        })
      }

      // Navigate back to carriers list
      router.push("/dashboard/carriers")
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update carrier." : "Failed to create carrier.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={handleCancel} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" disabled={saving} className="flex items-center">
            {saving ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Carrier
              </>
            )}
          </Button>
        </div>

        {isPrefilled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pre-filled Information</AlertTitle>
            <AlertDescription>
              This form has been pre-filled with data from the FMCSA lookup. Please review and complete any missing
              information before saving.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="equipment">Equipment & Terms</TabsTrigger>
            <TabsTrigger value="portal">Carrier Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dba_name">DBA Name</Label>
                    <Input id="dba_name" name="dba_name" value={formData.dba_name || ""} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mc_number">MC Number</Label>
                    <Input id="mc_number" name="mc_number" value={formData.mc_number || ""} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usdot">USDOT Number</Label>
                    <Input id="usdot" name="usdot" value={formData.usdot || ""} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">General Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} rows={4} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Lead Source</Label>
                  <Input id="source" name="source" value={formData.source || ""} onChange={handleChange} />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_number">Street Number</Label>
                    <Input
                      id="address_number"
                      name="address_number"
                      value={formData.address_number || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_street">Street Name</Label>
                    <Input
                      id="address_street"
                      name="address_street"
                      value={formData.address_street || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_suite">Suite/Unit</Label>
                  <Input
                    id="address_suite"
                    name="address_suite"
                    value={formData.address_suite || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_city">City</Label>
                    <Input
                      id="address_city"
                      name="address_city"
                      value={formData.address_city || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_state_or_province">State/Province</Label>
                    <Input
                      id="address_state_or_province"
                      name="address_state_or_province"
                      value={formData.address_state_or_province || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_zip_or_postal">ZIP/Postal</Label>
                    <Input
                      id="address_zip_or_postal"
                      name="address_zip_or_postal"
                      value={formData.address_zip_or_postal || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yard Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yard_address_number">Street Number</Label>
                    <Input
                      id="yard_address_number"
                      name="yard_address_number"
                      value={formData.yard_address_number || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yard_address_street">Street Name</Label>
                    <Input
                      id="yard_address_street"
                      name="yard_address_street"
                      value={formData.yard_address_street || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yard_address_suite">Suite/Unit</Label>
                  <Input
                    id="yard_address_suite"
                    name="yard_address_suite"
                    value={formData.yard_address_suite || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yard_address_city">City</Label>
                    <Input
                      id="yard_address_city"
                      name="yard_address_city"
                      value={formData.yard_address_city || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yard_address_state_or_province">State/Province</Label>
                    <Input
                      id="yard_address_state_or_province"
                      name="yard_address_state_or_province"
                      value={formData.yard_address_state_or_province || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yard_address_zip_or_postal">ZIP/Postal</Label>
                    <Input
                      id="yard_address_zip_or_postal"
                      name="yard_address_zip_or_postal"
                      value={formData.yard_address_zip_or_postal || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Main Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="main_contact_name">
                      Contact Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="main_contact_name"
                      name="main_contact_name"
                      value={formData.main_contact_name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="main_contact_phone">
                      Contact Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="main_contact_phone"
                      name="main_contact_phone"
                      value={formData.main_contact_phone || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="main_contact_email">
                      Contact Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="main_contact_email"
                      name="main_contact_email"
                      type="email"
                      value={formData.main_contact_email || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dispatch_email">Dispatch Email</Label>
                    <Input
                      id="dispatch_email"
                      name="dispatch_email"
                      type="email"
                      value={formData.dispatch_email || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dispatch_email_contact_person">Dispatch Contact Person</Label>
                    <Input
                      id="dispatch_email_contact_person"
                      name="dispatch_email_contact_person"
                      value={formData.dispatch_email_contact_person || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sales_email">Sales Email</Label>
                    <Input
                      id="sales_email"
                      name="sales_email"
                      type="email"
                      value={formData.sales_email || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_email">Owner Email</Label>
                    <Input
                      id="owner_email"
                      name="owner_email"
                      type="email"
                      value={formData.owner_email || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eta_email">ETA Email</Label>
                    <Input
                      id="eta_email"
                      name="eta_email"
                      type="email"
                      value={formData.eta_email || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="safety_email">Safety Email</Label>
                    <Input
                      id="safety_email"
                      name="safety_email"
                      type="email"
                      value={formData.safety_email || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tractor_units">Tractor Units</Label>
                    <Input
                      id="tractor_units"
                      name="tractor_units"
                      type="number"
                      value={formData.tractor_units || ""}
                      onChange={handleNumberChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trailer_units">Trailer Units</Label>
                    <Input
                      id="trailer_units"
                      name="trailer_units"
                      type="number"
                      value={formData.trailer_units || ""}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Textarea
                    id="payment_terms"
                    name="payment_terms"
                    value={formData.payment_terms || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., Net 30, Quick Pay, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Carrier Portal Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrier_portalactive">Portal Status</Label>
                    <Input
                      id="carrier_portalactive"
                      name="carrier_portalactive"
                      value={formData.carrier_portalactive || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrier_portal_activedate">Activation Date</Label>
                    <Input
                      id="carrier_portal_activedate"
                      name="carrier_portal_activedate"
                      type="date"
                      value={formData.carrier_portal_activedate || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrier_portalsignup_email">Signup Email</Label>
                  <Input
                    id="carrier_portalsignup_email"
                    name="carrier_portalsignup_email"
                    type="email"
                    value={formData.carrier_portalsignup_email || ""}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Carrier"}
          </Button>
        </div>
      </div>
    </form>
  )
}
