"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowLeft, Edit, Truck, MapPin, Building, Phone, Mail, Calendar, ClipboardList } from "lucide-react"
import { getCarrierById } from "@/lib/carrier-service"
import type { Carrier } from "@/types/carrier-types"

interface CarrierDetailsProps {
  carrierId: number
}

export function CarrierDetails({ carrierId }: CarrierDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [carrier, setCarrier] = useState<Carrier | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCarrier = async () => {
      try {
        const data = await getCarrierById(carrierId)
        setCarrier(data)
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
  }, [carrierId, toast])

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    router.push(`/dashboard/carriers/${carrierId}/edit`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!carrier) {
    return (
      <div className="text-center py-8">
        <p>Carrier not found.</p>
        <Button onClick={handleBack} className="mt-4">
          Back to Carriers
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button onClick={handleBack} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Carriers
        </Button>

        <Button onClick={handleEdit} className="flex items-center">
          <Edit className="mr-2 h-4 w-4" />
          Edit Carrier
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{carrier.company_name}</CardTitle>
              {carrier.dba_name && <p className="text-muted-foreground">DBA: {carrier.dba_name}</p>}
            </div>
            <Badge variant={carrier.active ? "default" : "outline"}>{carrier.active ? "Active" : "Inactive"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">MC Number</div>
                <div className="font-medium">{carrier.mc_number || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">USDOT</div>
                <div className="font-medium">{carrier.usdot || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">{formatDate(carrier.created_at)}</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="mt-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Source & Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Source</div>
                        <div>{carrier.source || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Notes</div>
                        <div className="whitespace-pre-wrap">{carrier.notes || "N/A"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="text-sm text-muted-foreground">Payment Terms</div>
                      <div>{carrier.payment_terms || "N/A"}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Carrier Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Portal Status</div>
                      <div>{carrier.carrier_portalactive || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Signup Email</div>
                      <div>{carrier.carrier_portalsignup_email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Active Date</div>
                      <div>
                        {carrier.carrier_portal_activedate ? formatDate(carrier.carrier_portal_activedate) : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Main Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <ClipboardList className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{carrier.main_contact_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{carrier.main_contact_phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{carrier.main_contact_email}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Department Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">General Email</div>
                      <div>{carrier.email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dispatch Email</div>
                      <div>{carrier.dispatch_email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dispatch Contact</div>
                      <div>{carrier.dispatch_email_contact_person || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Sales Email</div>
                      <div>{carrier.sales_email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Owner Email</div>
                      <div>{carrier.owner_email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">ETA Email</div>
                      <div>{carrier.eta_email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Safety Email</div>
                      <div>{carrier.safety_email || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Business Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      {carrier.address_number || carrier.address_street ? (
                        <div>
                          <div>
                            {carrier.address_number} {carrier.address_street}
                            {carrier.address_suite && `, ${carrier.address_suite}`}
                          </div>
                          <div>
                            {carrier.address_city}
                            {carrier.address_city && carrier.address_state_or_province && ", "}
                            {carrier.address_state_or_province} {carrier.address_zip_or_postal}
                          </div>
                        </div>
                      ) : (
                        <div>No address provided</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Yard Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      {carrier.yard_address_number || carrier.yard_address_street ? (
                        <div>
                          <div>
                            {carrier.yard_address_number} {carrier.yard_address_street}
                            {carrier.yard_address_suite && `, ${carrier.yard_address_suite}`}
                          </div>
                          <div>
                            {carrier.yard_address_city}
                            {carrier.yard_address_city && carrier.yard_address_state_or_province && ", "}
                            {carrier.yard_address_state_or_province} {carrier.yard_address_zip_or_postal}
                          </div>
                        </div>
                      ) : (
                        <div>No yard address provided</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Tractor Units</div>
                      <div>{carrier.tractor_units !== null ? carrier.tractor_units : "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Trailer Units</div>
                      <div>{carrier.trailer_units !== null ? carrier.trailer_units : "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
