"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROVINCES, DEFAULT_PROVINCE } from "./constants"
import type { LoadEntry, Client, Carrier } from "./types"
import { v4 as uuidv4 } from "uuid"
import { RefreshCw } from "lucide-react"
import {
  calculateClientHST,
  calculateClientTotal,
  calculateCarrierPreTax,
  calculateCarrierHST,
  calculateHSTPayable,
  calculateProfit,
} from "./calculation-logic"

interface AddLoadFormProps {
  onAddLoad: (load: LoadEntry) => void
  clients: Client[]
  carriers: Carrier[]
  lastLoad: LoadEntry | null
}

export function AddLoadForm({ onAddLoad, clients, carriers, lastLoad }: AddLoadFormProps) {
  const [loadNumber, setLoadNumber] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [clientBaseAmount, setClientBaseAmount] = useState("")
  const [carrierAllInAmount, setCarrierAllInAmount] = useState("")
  const [province, setProvince] = useState(DEFAULT_PROVINCE.name)
  const [deliveryProvince, setDeliveryProvince] = useState(DEFAULT_PROVINCE.name)
  const [taxRate, setTaxRate] = useState(DEFAULT_PROVINCE.taxRate)
  const [clientId, setClientId] = useState("")
  const [carrierId, setCarrierId] = useState("")
  const [dateError, setDateError] = useState("")

  useEffect(() => {
    const selectedProvince = PROVINCES.find((p) => p.name === province)
    if (selectedProvince) {
      setTaxRate(selectedProvince.taxRate)
    }
  }, [province])

  const repopulateForm = () => {
    if (!lastLoad) return

    setLoadNumber(lastLoad.loadNumber)

    // Format the date to MM/DD/YYYY HH:MM format
    const date = new Date(lastLoad.deliveryDate)
    const formattedDate = formatDateForDisplay(date)
    setDeliveryDate(formattedDate)

    setClientBaseAmount(lastLoad.clientBaseAmount.toString())
    setCarrierAllInAmount(lastLoad.carrierAllInAmount.toString())
    setProvince(lastLoad.province)
    setDeliveryProvince(lastLoad.deliveryProvince || lastLoad.province)
    setClientId(lastLoad.clientId)
    setCarrierId(lastLoad.carrierId)
  }

  // Format date as MM/DD/YYYY HH:MM
  const formatDateForDisplay = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${month}/${day}/${year} ${hours}:${minutes}`
  }

  // Parse date string in format MM/DD/YYYY HH:MM or MM/DD/YYYY
  const parseDateString = (dateString: string): Date | null => {
    setDateError("")

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
    setDateError("Please enter date as MM/DD/YYYY HH:MM or MM/DD/YYYY")
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId || !carrierId) {
      alert("Please select both a client and a carrier")
      return
    }

    // Parse and validate the delivery date
    const parsedDate = parseDateString(deliveryDate)
    if (!parsedDate) {
      return // Error is already set by parseDateString
    }

    const clientBase = Number.parseFloat(clientBaseAmount) || 0
    const carrierAllIn = Number.parseFloat(carrierAllInAmount) || 0

    // Calculate all values
    const clientHST = calculateClientHST(clientBase, taxRate)
    const clientTotal = calculateClientTotal(clientBase, clientHST)
    const carrierPreTax = calculateCarrierPreTax(carrierAllIn, taxRate)
    const carrierHST = calculateCarrierHST(carrierAllIn, carrierPreTax)
    const hstPayable = calculateHSTPayable(clientHST, carrierHST, 0) // No ITCs per load anymore
    const profit = calculateProfit(clientBase, carrierPreTax)

    const newLoad: LoadEntry = {
      id: uuidv4(),
      loadNumber,
      deliveryDate: parsedDate,
      clientBaseAmount: clientBase,
      carrierAllInAmount: carrierAllIn,
      province,
      deliveryProvince,
      taxRate,
      clientId,
      carrierId,
      clientHST,
      clientTotal,
      carrierPreTax,
      carrierHST,
      hstPayable,
      profit,
    }

    onAddLoad(newLoad)

    // Reset form
    setLoadNumber("")
    setDeliveryDate("")
    setClientBaseAmount("")
    setCarrierAllInAmount("")
    setClientId("")
    setCarrierId("")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Add New Load</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={repopulateForm}
          disabled={!lastLoad}
          title="Repopulate with last load values"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Repopulate
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loadNumber">Load Number</Label>
              <Input
                id="loadNumber"
                value={loadNumber}
                onChange={(e) => setLoadNumber(e.target.value)}
                placeholder="Enter load number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date & Time</Label>
              <Input
                id="deliveryDate"
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder="MM/DD/YYYY HH:MM"
                required
              />
              {dateError && <p className="text-sm text-red-500 mt-1">{dateError}</p>}
              <p className="text-xs text-muted-foreground">Format: MM/DD/YYYY HH:MM (24-hour time)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxProvince">Tax Province</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tax province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name} - {p.taxName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryProvince">Delivery Province</Label>
              <Select value={deliveryProvince} onValueChange={setDeliveryProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery province" />
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
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>
                      No clients available - add one first
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Select value={carrierId} onValueChange={setCarrierId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.length === 0 ? (
                    <SelectItem value="no-carriers" disabled>
                      No carriers available - add one first
                    </SelectItem>
                  ) : (
                    carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientBaseAmount">Client Base Amount ($)</Label>
              <Input
                id="clientBaseAmount"
                type="number"
                step="0.01"
                min="0"
                value={clientBaseAmount}
                onChange={(e) => setClientBaseAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrierAllInAmount">Carrier All-In Amount ($)</Label>
              <Input
                id="carrierAllInAmount"
                type="number"
                step="0.01"
                min="0"
                value={carrierAllInAmount}
                onChange={(e) => setCarrierAllInAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Add Load
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
