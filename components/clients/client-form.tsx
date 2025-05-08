"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import type { Client } from "@/types/clients"

interface ClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (clientData: Partial<Client>) => Promise<void>
  client?: Client | null
  title: string
  description: string
  submitLabel: string
}

export function ClientForm({ open, onOpenChange, onSubmit, client, title, description, submitLabel }: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    company_name: "",
    contact_name: "",
    email: "",
    phone_number: "",
    address_number: "",
    address_street: "",
    address_suite: "",
    address_city: "",
    address_state_province: "",
    address_zip_postal: "",
    payment_terms: "",
    credit_limit: undefined,
    notes: "",
    active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Load client data when editing
  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id,
        company_name: client.company_name || "",
        contact_name: client.contact_name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        address_number: client.address_number || "",
        address_street: client.address_street || "",
        address_suite: client.address_suite || "",
        address_city: client.address_city || "",
        address_state_province: client.address_state_province || "",
        address_zip_postal: client.address_zip_postal || "",
        payment_terms: client.payment_terms || "",
        credit_limit: client.credit_limit,
        notes: client.notes || "",
        active: client.active !== false, // Default to true if undefined
      })
    } else {
      // Reset form when adding a new client
      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone_number: "",
        address_number: "",
        address_street: "",
        address_suite: "",
        address_city: "",
        address_state_province: "",
        address_zip_postal: "",
        payment_terms: "",
        credit_limit: undefined,
        notes: "",
        active: true,
      })
    }

    // Clear errors and status when dialog opens/closes
    setErrors({})
    setFormStatus(null)
  }, [client, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === "" ? undefined : Number.parseFloat(value)
    setFormData((prev) => ({ ...prev, [name]: numValue }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.company_name?.trim()) {
      newErrors.company_name = "Company name is required"
    }

    if (!formData.contact_name?.trim()) {
      newErrors.contact_name = "Contact name is required"
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else {
      // Email format validation
      const emailRegex = /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format"
      }
    }

    // Phone number format validation (if provided)
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be 10 digits"
    }

    // Credit limit validation (if provided)
    if (formData.credit_limit !== undefined && formData.credit_limit < 0) {
      newErrors.credit_limit = "Credit limit must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormStatus(null)

    try {
      await onSubmit(formData)
      setFormStatus({
        message: client ? "Customer updated successfully!" : "Customer created successfully!",
        type: "success",
      })

      // Wait a moment to show success message before closing
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (error) {
      console.error("Error submitting client form:", error)
      setFormStatus({
        message: "Failed to save customer. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto max-h-[65vh] pr-4 -mr-4 pb-2">
            <div className="space-y-6 py-4 pr-4">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Company Information</h3>
                <Separator className="mb-4" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className={errors.company_name ? "border-red-500" : ""}
                    />
                    {errors.company_name && <p className="text-xs text-red-500">{errors.company_name}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">
                        Contact Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact_name"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleChange}
                        className={errors.contact_name ? "border-red-500" : ""}
                      />
                      {errors.contact_name && <p className="text-xs text-red-500">{errors.contact_name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number (10 digits)</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="1234567890"
                      className={errors.phone_number ? "border-red-500" : ""}
                    />
                    {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number}</p>}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Address</h3>
                <Separator className="mb-4" />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address_number">Number</Label>
                      <Input
                        id="address_number"
                        name="address_number"
                        value={formData.address_number}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address_street">Street</Label>
                      <Input
                        id="address_street"
                        name="address_street"
                        value={formData.address_street}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_suite">Suite/Apt</Label>
                    <Input
                      id="address_suite"
                      name="address_suite"
                      value={formData.address_suite}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address_city">City</Label>
                      <Input
                        id="address_city"
                        name="address_city"
                        value={formData.address_city}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_state_province">State/Province</Label>
                      <Input
                        id="address_state_province"
                        name="address_state_province"
                        value={formData.address_state_province}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_zip_postal">ZIP/Postal Code</Label>
                      <Input
                        id="address_zip_postal"
                        name="address_zip_postal"
                        value={formData.address_zip_postal}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Billing Information</h3>
                <Separator className="mb-4" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Input
                      id="payment_terms"
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleChange}
                      placeholder="e.g. Net 30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credit_limit">Credit Limit ($)</Label>
                    <Input
                      id="credit_limit"
                      name="credit_limit"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.credit_limit === undefined ? "" : formData.credit_limit}
                      onChange={handleNumberChange}
                      className={errors.credit_limit ? "border-red-500" : ""}
                    />
                    {errors.credit_limit && <p className="text-xs text-red-500">{errors.credit_limit}</p>}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                <Separator className="mb-4" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status message area */}
          {formStatus && (
            <div
              className={`mt-4 text-sm font-medium p-2 rounded ${
                formStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {formStatus.message}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
