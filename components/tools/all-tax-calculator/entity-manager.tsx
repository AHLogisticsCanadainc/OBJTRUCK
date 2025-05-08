"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROVINCES } from "./constants"
import type { Client, Carrier, Vendor } from "./types"
import { v4 as uuidv4 } from "uuid"
import { Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EntityManagerProps {
  clients: Client[]
  carriers: Carrier[]
  vendors: Vendor[]
  onAddClient: (client: Client) => void
  onAddCarrier: (carrier: Carrier) => void
  onAddVendor: (vendor: Vendor) => void
  onDeleteClient: (id: string) => void
  onDeleteCarrier: (id: string) => void
  onDeleteVendor: (id: string) => void
}

export function EntityManager({
  clients,
  carriers,
  vendors,
  onAddClient,
  onAddCarrier,
  onAddVendor,
  onDeleteClient,
  onDeleteCarrier,
  onDeleteVendor,
}: EntityManagerProps) {
  const [activeTab, setActiveTab] = useState<"clients" | "carriers" | "vendors">("clients")

  // Client form state
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientHstNumber, setClientHstNumber] = useState("")
  const [clientProvince, setClientProvince] = useState("")

  // Carrier form state
  const [carrierName, setCarrierName] = useState("")
  const [carrierMcNumber, setCarrierMcNumber] = useState("")
  const [carrierEmail, setCarrierEmail] = useState("")
  const [carrierPhone, setCarrierPhone] = useState("")
  const [carrierHstNumber, setCarrierHstNumber] = useState("")
  const [carrierProvince, setCarrierProvince] = useState("")

  // Vendor form state
  const [vendorName, setVendorName] = useState("")
  const [vendorEmail, setVendorEmail] = useState("")
  const [vendorPhone, setVendorPhone] = useState("")
  const [vendorAddress, setVendorAddress] = useState("")
  const [vendorHstNumber, setVendorHstNumber] = useState("")
  const [vendorProvince, setVendorProvince] = useState("")
  const [vendorCategory, setVendorCategory] = useState("")

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientName) {
      alert("Client name is required")
      return
    }

    const newClient: Client = {
      id: uuidv4(),
      name: clientName,
      email: clientEmail || undefined,
      phone: clientPhone || undefined,
      address: clientAddress || undefined,
      hstNumber: clientHstNumber || undefined,
      province: clientProvince || undefined,
    }

    onAddClient(newClient)

    // Clear form
    setClientName("")
    setClientEmail("")
    setClientPhone("")
    setClientAddress("")
    setClientHstNumber("")
    setClientProvince("")
  }

  const handleAddCarrier = (e: React.FormEvent) => {
    e.preventDefault()

    if (!carrierName) {
      alert("Carrier name is required")
      return
    }

    const newCarrier: Carrier = {
      id: uuidv4(),
      name: carrierName,
      mcNumber: carrierMcNumber || undefined,
      email: carrierEmail || undefined,
      phone: carrierPhone || undefined,
      hstNumber: carrierHstNumber || undefined,
      province: carrierProvince || undefined,
    }

    onAddCarrier(newCarrier)

    // Clear form
    setCarrierName("")
    setCarrierMcNumber("")
    setCarrierEmail("")
    setCarrierPhone("")
    setCarrierHstNumber("")
    setCarrierProvince("")
  }

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault()

    if (!vendorName) {
      alert("Vendor name is required")
      return
    }

    const newVendor: Vendor = {
      id: uuidv4(),
      name: vendorName,
      email: vendorEmail || undefined,
      phone: vendorPhone || undefined,
      address: vendorAddress || undefined,
      hstNumber: vendorHstNumber || undefined,
      province: vendorProvince || undefined,
      category: vendorCategory || undefined,
    }

    onAddVendor(newVendor)

    // Clear form
    setVendorName("")
    setVendorEmail("")
    setVendorPhone("")
    setVendorAddress("")
    setVendorHstNumber("")
    setVendorProvince("")
    setVendorCategory("")
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "clients" | "carriers" | "vendors")}>
        <TabsList className="mb-4">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Client</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddClient}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email (Optional)</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone (Optional)</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientHstNumber">HST Number (Optional)</Label>
                    <Input
                      id="clientHstNumber"
                      value={clientHstNumber}
                      onChange={(e) => setClientHstNumber(e.target.value)}
                      placeholder="123456789RT0001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientProvince">Province (Optional)</Label>
                    <Select value={clientProvince} onValueChange={setClientProvince}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Address (Optional)</Label>
                    <Input
                      id="clientAddress"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Add Client
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client List</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No clients added yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>HST Number</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email || "-"}</TableCell>
                          <TableCell>{client.phone || "-"}</TableCell>
                          <TableCell>{client.province || "-"}</TableCell>
                          <TableCell>{client.hstNumber || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteClient(client.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carriers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Carrier</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddCarrier}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrierName">Carrier Name</Label>
                    <Input
                      id="carrierName"
                      value={carrierName}
                      onChange={(e) => setCarrierName(e.target.value)}
                      placeholder="Enter carrier name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrierMcNumber">MC Number (Optional)</Label>
                    <Input
                      id="carrierMcNumber"
                      value={carrierMcNumber}
                      onChange={(e) => setCarrierMcNumber(e.target.value)}
                      placeholder="MC123456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrierEmail">Email (Optional)</Label>
                    <Input
                      id="carrierEmail"
                      type="email"
                      value={carrierEmail}
                      onChange={(e) => setCarrierEmail(e.target.value)}
                      placeholder="carrier@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrierPhone">Phone (Optional)</Label>
                    <Input
                      id="carrierPhone"
                      value={carrierPhone}
                      onChange={(e) => setCarrierPhone(e.target.value)}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrierHstNumber">HST Number (Optional)</Label>
                    <Input
                      id="carrierHstNumber"
                      value={carrierHstNumber}
                      onChange={(e) => setCarrierHstNumber(e.target.value)}
                      placeholder="123456789RT0001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrierProvince">Province (Optional)</Label>
                    <Select value={carrierProvince} onValueChange={setCarrierProvince}>
                      <SelectTrigger>
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

                <Button type="submit" className="w-full">
                  Add Carrier
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carrier List</CardTitle>
            </CardHeader>
            <CardContent>
              {carriers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No carriers added yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>MC Number</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>HST Number</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carriers.map((carrier) => (
                        <TableRow key={carrier.id}>
                          <TableCell className="font-medium">{carrier.name}</TableCell>
                          <TableCell>{carrier.mcNumber || "-"}</TableCell>
                          <TableCell>{carrier.email || "-"}</TableCell>
                          <TableCell>{carrier.phone || "-"}</TableCell>
                          <TableCell>{carrier.province || "-"}</TableCell>
                          <TableCell>{carrier.hstNumber || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteCarrier(carrier.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Vendor</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddVendor}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name</Label>
                    <Input
                      id="vendorName"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorCategory">Category (Optional)</Label>
                    <Input
                      id="vendorCategory"
                      value={vendorCategory}
                      onChange={(e) => setVendorCategory(e.target.value)}
                      placeholder="e.g., Fuel, Office Supplies, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorEmail">Email (Optional)</Label>
                    <Input
                      id="vendorEmail"
                      type="email"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder="vendor@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorPhone">Phone (Optional)</Label>
                    <Input
                      id="vendorPhone"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorHstNumber">HST Number (Optional)</Label>
                    <Input
                      id="vendorHstNumber"
                      value={vendorHstNumber}
                      onChange={(e) => setVendorHstNumber(e.target.value)}
                      placeholder="123456789RT0001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorProvince">Province (Optional)</Label>
                    <Select value={vendorProvince} onValueChange={setVendorProvince}>
                      <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="vendorAddress">Address (Optional)</Label>
                  <Input
                    id="vendorAddress"
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    placeholder="Enter address"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Vendor
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor List</CardTitle>
            </CardHeader>
            <CardContent>
              {vendors.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No vendors added yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>HST Number</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>{vendor.category || "-"}</TableCell>
                          <TableCell>{vendor.email || "-"}</TableCell>
                          <TableCell>{vendor.phone || "-"}</TableCell>
                          <TableCell>{vendor.province || "-"}</TableCell>
                          <TableCell>{vendor.hstNumber || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteVendor(vendor.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
