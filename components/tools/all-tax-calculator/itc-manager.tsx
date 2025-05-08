"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ITCEntry, Vendor } from "./types"
import { v4 as uuidv4 } from "uuid"
import { Trash2 } from "lucide-react"
import { formatCurrency } from "./calculation-logic"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROVINCES } from "./constants"

interface ITCManagerProps {
  itcs: ITCEntry[]
  vendors: Vendor[]
  onAddITC: (itc: ITCEntry) => void
  onDeleteITC: (id: string) => void
}

export function ITCManager({ itcs, vendors, onAddITC, onDeleteITC }: ITCManagerProps) {
  const [description, setDescription] = useState("")
  const [paidTo, setPaidTo] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [hstNumber, setHstNumber] = useState("")
  const [amountBeforeTax, setAmountBeforeTax] = useState("")
  const [taxAmount, setTaxAmount] = useState("")
  const [date, setDate] = useState("")
  const [dateError, setDateError] = useState("")
  const [invoiceDateError, setInvoiceDateError] = useState("")
  const [selectedVendorId, setSelectedVendorId] = useState("")
  const [category, setCategory] = useState("")
  const [province, setProvince] = useState("")

  // When a vendor is selected, populate the form fields
  useEffect(() => {
    if (selectedVendorId && selectedVendorId !== "none") {
      const vendor = vendors.find((v) => v.id === selectedVendorId)
      if (vendor) {
        setPaidTo(vendor.name)
        setHstNumber(vendor.hstNumber || "")
        setCategory(vendor.category || "")
        setProvince(vendor.province || "")
      }
    }
  }, [selectedVendorId, vendors])

  // Parse date string in format MM/DD/YYYY HH:MM or MM/DD/YYYY
  const parseDateString = (dateString: string, setError: (error: string) => void): Date | null => {
    setError("")

    if (!dateString.trim()) {
      return null
    }

    // Try to parse MM/DD/YYYY HH:MM format
    const fullPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/
    const fullMatch = dateString.match(fullPattern)

    if (fullMatch) {
      const [_, month, day, year, hours, minutes] = fullMatch
      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day),
        Number.parseInt(hours),
        Number.parseInt(minutes),
      )

      if (!isNaN(date.getTime())) {
        return date
      }
    }

    // Try to parse MM/DD/YYYY format (default to midnight)
    const dateOnlyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    const dateOnlyMatch = dateString.match(dateOnlyPattern)

    if (dateOnlyMatch) {
      const [_, month, day, year] = dateOnlyMatch
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day), 0, 0)

      if (!isNaN(date.getTime())) {
        return date
      }
    }

    // If we got here, the date format is invalid
    setError("Please enter date as MM/DD/YYYY HH:MM or MM/DD/YYYY")
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Parse and validate the dates
    const parsedDate = parseDateString(date, setDateError)
    if (!date.trim()) {
      setDateError("Payment date is required")
      return
    }
    if (!parsedDate) {
      return // Error is already set by parseDateString
    }

    let parsedInvoiceDate = null
    if (invoiceDate.trim()) {
      parsedInvoiceDate = parseDateString(invoiceDate, setInvoiceDateError)
      if (invoiceDate.trim() && !parsedInvoiceDate) {
        return // Error is already set by parseDateString
      }
    }

    const amountBefore = Number.parseFloat(amountBeforeTax) || 0
    const tax = Number.parseFloat(taxAmount) || 0

    const newITC: ITCEntry = {
      id: uuidv4(),
      description,
      paidTo,
      invoiceDate: parsedInvoiceDate || undefined,
      hstNumber: hstNumber || undefined,
      amountBeforeTax: amountBefore,
      taxAmount: tax,
      date: parsedDate,
      category: category || undefined,
      province: province || undefined,
      vendorId: selectedVendorId && selectedVendorId !== "none" ? selectedVendorId : undefined,
    }

    onAddITC(newITC)

    // Reset form
    setDescription("")
    setPaidTo("")
    setInvoiceDate("")
    setHstNumber("")
    setAmountBeforeTax("")
    setTaxAmount("")
    setDate("")
    setSelectedVendorId("")
    setCategory("")
    setProvince("")
  }

  // Format date with time
  const formatDate = (date?: Date) => {
    if (!date) return "-"

    const d = new Date(date)
    if (isNaN(d.getTime())) return "-"

    // Format as MM/DD/YYYY HH:MM
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")

    return `${month}/${day}/${year} ${hours}:${minutes}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Input Tax Credit (ITC)</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {vendors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="vendorSelect">Select Vendor (Optional)</Label>
                <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                  <SelectTrigger id="vendorSelect">
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Select Vendor --</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecting a vendor will auto-fill some fields. You can still edit them if needed.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidTo">Paid To</Label>
                <Input
                  id="paidTo"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder="Enter vendor name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Fuel, Office Supplies"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province (Optional)</Label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger id="province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- None --</SelectItem>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date (Optional)</Label>
                <Input
                  id="invoiceDate"
                  type="text"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  placeholder="MM/DD/YYYY HH:MM"
                />
                {invoiceDateError && <p className="text-sm text-red-500 mt-1">{invoiceDateError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hstNumber">HST Number (Optional)</Label>
                <Input
                  id="hstNumber"
                  value={hstNumber}
                  onChange={(e) => setHstNumber(e.target.value)}
                  placeholder="Enter HST number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Payment Date</Label>
                <Input
                  id="date"
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="MM/DD/YYYY HH:MM"
                  required
                />
                {dateError && <p className="text-sm text-red-500 mt-1">{dateError}</p>}
                <p className="text-xs text-muted-foreground">Format: MM/DD/YYYY HH:MM (24-hour time)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amountBeforeTax">Amount Before Tax ($)</Label>
                <Input
                  id="amountBeforeTax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountBeforeTax}
                  onChange={(e) => setAmountBeforeTax(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxAmount">Tax Amount (ITC) ($)</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Add ITC
            </Button>
          </CardFooter>
        </form>
      </Card>

      {itcs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Input Tax Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid To</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Amount Before Tax</TableHead>
                    <TableHead className="text-right">Tax Amount (ITC)</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itcs.map((itc) => (
                    <TableRow key={itc.id}>
                      <TableCell>{itc.description}</TableCell>
                      <TableCell>
                        {itc.vendorId ? (
                          <span className="flex items-center">
                            {itc.paidTo}
                            <span className="ml-1 text-xs text-muted-foreground">(Vendor)</span>
                          </span>
                        ) : (
                          itc.paidTo
                        )}
                      </TableCell>
                      <TableCell>{itc.category || "-"}</TableCell>
                      <TableCell>{itc.invoiceDate ? formatDate(itc.invoiceDate) : "-"}</TableCell>
                      <TableCell>{formatDate(itc.date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(itc.amountBeforeTax)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(itc.taxAmount)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteITC(itc.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={5} className="text-right font-medium">
                      Totals:
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(itcs.reduce((sum, itc) => sum + itc.amountBeforeTax, 0))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(itcs.reduce((sum, itc) => sum + itc.taxAmount, 0))}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
