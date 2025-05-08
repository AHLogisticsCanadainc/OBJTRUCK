"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  Key,
  UserCheck,
  AlertCircle,
} from "lucide-react"
import type { Client } from "@/types/clients"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface CustomerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  onEdit: () => void
}

export function CustomerDetailsDialog({ open, onOpenChange, client, onEdit }: CustomerDetailsDialogProps) {
  if (!client) return null

  // Format date strings
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Format time strings
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }

  // Format phone number
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "N/A"
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
    }
    return phone
  }

  // Check if client has portal access
  const hasPortalAccess = client.Portalcreated || client.portalactivated || client.signup_email

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            {client.company_name}
            <Badge
              variant={client.active ? "outline" : "secondary"}
              className={`ml-3 ${
                client.active
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                  : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              {client.active ? <CheckCircle className="h-3.5 w-3.5 mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
              {client.active ? "Active" : "Inactive"}
            </Badge>

            {hasPortalAccess && (
              <Badge
                variant="outline"
                className="ml-3 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              >
                <Globe className="h-3.5 w-3.5 mr-1" />
                Portal Access
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Customer ID: {client.id}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[65vh] pr-4 -mr-4 pb-2">
          <div className="space-y-6 py-4 pr-4">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Contact Name</p>
                  <p className="font-medium">{client.contact_name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Email
                  </p>
                  <p className="font-medium">{client.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Phone Number
                  </p>
                  <p className="font-medium">{formatPhoneNumber(client.phone_number)}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium mb-2">Address</h3>
              <Separator className="mb-4" />

              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {[
                        client.address_number,
                        client.address_street,
                        client.address_suite ? `Suite ${client.address_suite}` : null,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    <p>
                      {[client.address_city, client.address_state_province, client.address_zip_postal]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div>
              <h3 className="text-lg font-medium mb-2">Billing Information</h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <CreditCard className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Payment Terms
                  </p>
                  <p className="font-medium">{client.payment_terms || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Credit Limit</p>
                  <p className="font-medium">
                    {client.credit_limit ? `$${client.credit_limit.toLocaleString()}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Client Portal Information */}
            <div
              className={
                hasPortalAccess
                  ? "bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800"
                  : ""
              }
            >
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Client Portal Access
              </h3>
              <Separator className="mb-4" />

              {hasPortalAccess ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                      Portal Created
                    </p>
                    <p className="font-medium">{client.Portalcreated ? formatDate(client.Portalcreated) : "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Key className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                      Portal Activation Status
                    </p>
                    <p className="font-medium flex items-center">
                      {client.portalactivated ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1.5 text-green-600" />
                          {client.portalactivated}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1.5 text-amber-600" />
                          Not Activated
                        </>
                      )}
                    </p>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                      Portal Signup Email
                    </p>
                    <p className="font-medium">{client.signup_email || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">This customer does not have portal access configured.</p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium mb-2">Additional Information</h3>
              <Separator className="mb-4" />

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{client.notes || "No notes available"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h3 className="text-lg font-medium mb-2">System Information</h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Created Date
                  </p>
                  <p className="font-medium">{formatDateTime(client.created_at)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Last Updated
                  </p>
                  <p className="font-medium">{formatDateTime(client.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
