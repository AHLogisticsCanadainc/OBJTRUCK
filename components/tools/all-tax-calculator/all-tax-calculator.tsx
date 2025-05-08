"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { AddLoadForm } from "./add-load-form"
import { LoadsTable } from "./loads-table"
import { ITCManager } from "./itc-manager"
import { EntityManager } from "./entity-manager"
import type { LoadEntry, Client, Carrier, ITCEntry, Vendor } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  getTaxLoads,
  getTaxITCs,
  getTaxClients,
  getTaxCarriers,
  getTaxVendors,
  addTaxLoad,
  deleteTaxLoad,
  addTaxITC,
  deleteTaxITC,
  addTaxClient,
  addTaxCarrier,
  addTaxVendor,
  deleteTaxClient,
  deleteTaxCarrier,
  deleteTaxVendor,
} from "@/lib/tax-calculator-db"
import { supabase } from "@/lib/database"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { PROVINCES } from "./constants"

export function AllTaxCalculator() {
  const [loads, setLoads] = useState<LoadEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [itcs, setITCs] = useState<ITCEntry[]>([])
  const [lastLoad, setLastLoad] = useState<LoadEntry | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()

  // Get the current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
    }
    getCurrentUser()
  }, [])

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch all data in parallel
        const [loadsResult, itcsResult, clientsResult, carriersResult, vendorsResult] = await Promise.all([
          getTaxLoads(),
          getTaxITCs(),
          getTaxClients(),
          getTaxCarriers(),
          getTaxVendors(),
        ])

        // Update state with fetched data
        setLoads(loadsResult.data || [])
        setITCs(itcsResult.data || [])
        setClients(clientsResult.data || [])
        setCarriers(carriersResult.data || [])
        setVendors(vendorsResult.data || [])
      } catch (error) {
        console.error("Error loading tax calculator data:", error)
        toast({
          title: "Failed to load data",
          description: "There was an error loading your tax calculator data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleAddLoad = async (load: LoadEntry) => {
    try {
      const { data, error } = await addTaxLoad(load, userId || undefined)
      if (error) throw error

      // Add the new load to state
      if (data) {
        const newLoad: LoadEntry = {
          id: data.id,
          loadNumber: data.load_number,
          deliveryDate: new Date(data.delivery_date),
          clientBaseAmount: Number(data.client_base_amount),
          carrierAllInAmount: Number(data.carrier_all_in_amount),
          province: data.province,
          deliveryProvince: data.delivery_province,
          taxRate: Number(data.tax_rate),
          clientId: data.client_id,
          carrierId: data.carrier_id,
          clientHST: Number(data.client_hst),
          clientTotal: Number(data.client_total),
          carrierPreTax: Number(data.carrier_pre_tax),
          carrierHST: Number(data.carrier_hst),
          hstPayable: Number(data.hst_payable),
          profit: Number(data.profit),
        }

        setLoads([...loads, newLoad])
        setLastLoad(newLoad)

        toast({
          title: "Load added",
          description: `Load ${load.loadNumber} has been added successfully.`,
        })
      }
    } catch (error) {
      console.error("Error adding load:", error)
      toast({
        title: "Failed to add load",
        description: "There was an error adding your load.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLoad = async (id: string) => {
    try {
      const { success, error } = await deleteTaxLoad(id)
      if (error) throw error

      // Remove the load from state
      setLoads(loads.filter((load) => load.id !== id))

      toast({
        title: "Load deleted",
        description: "The load has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting load:", error)
      toast({
        title: "Failed to delete load",
        description: "There was an error deleting the load.",
        variant: "destructive",
      })
    }
  }

  const handleAddITC = async (itc: ITCEntry) => {
    try {
      const { data, error } = await addTaxITC(itc, userId || undefined)
      if (error) throw error

      // Add the new ITC to state
      if (data) {
        const newITC: ITCEntry = {
          id: data.id,
          description: data.description,
          paidTo: data.paid_to,
          invoiceDate: data.invoice_date ? new Date(data.invoice_date) : undefined,
          hstNumber: data.hst_number,
          amountBeforeTax: Number(data.amount_before_tax),
          taxAmount: Number(data.tax_amount),
          date: new Date(data.date),
          category: data.category,
          province: data.province,
          vendorId: data.vendor_id,
        }

        setITCs([...itcs, newITC])

        toast({
          title: "ITC added",
          description: "The input tax credit has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding ITC:", error)
      toast({
        title: "Failed to add ITC",
        description: "There was an error adding your input tax credit.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteITC = async (id: string) => {
    try {
      const { success, error } = await deleteTaxITC(id)
      if (error) throw error

      // Remove the ITC from state
      setITCs(itcs.filter((itc) => itc.id !== id))

      toast({
        title: "ITC deleted",
        description: "The input tax credit has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting ITC:", error)
      toast({
        title: "Failed to delete ITC",
        description: "There was an error deleting the input tax credit.",
        variant: "destructive",
      })
    }
  }

  const handleAddClient = async (client: Client) => {
    try {
      const { data, error } = await addTaxClient(client)
      if (error) throw error

      // Add the new client to state
      if (data) {
        const newClient: Client = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          hstNumber: data.hst_number,
          province: data.province,
        }

        setClients([...clients, newClient])

        toast({
          title: "Client added",
          description: `Client ${client.name} has been added successfully.`,
        })
      }
    } catch (error) {
      console.error("Error adding client:", error)
      toast({
        title: "Failed to add client",
        description: "There was an error adding your client.",
        variant: "destructive",
      })
    }
  }

  const handleAddCarrier = async (carrier: Carrier) => {
    try {
      const { data, error } = await addTaxCarrier(carrier)
      if (error) throw error

      // Add the new carrier to state
      if (data) {
        const newCarrier: Carrier = {
          id: data.id,
          name: data.name,
          mcNumber: data.mc_number,
          email: data.email,
          phone: data.phone,
          hstNumber: data.hst_number,
          province: data.province,
        }

        setCarriers([...carriers, newCarrier])

        toast({
          title: "Carrier added",
          description: `Carrier ${carrier.name} has been added successfully.`,
        })
      }
    } catch (error) {
      console.error("Error adding carrier:", error)
      toast({
        title: "Failed to add carrier",
        description: "There was an error adding your carrier.",
        variant: "destructive",
      })
    }
  }

  const handleAddVendor = async (vendor: Vendor) => {
    try {
      const { data, error } = await addTaxVendor(vendor, userId || undefined)
      if (error) throw error

      // Add the new vendor to state
      if (data) {
        const newVendor: Vendor = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          hstNumber: data.hst_number,
          province: data.province,
          category: data.category,
        }

        setVendors([...vendors, newVendor])

        toast({
          title: "Vendor added",
          description: `Vendor ${vendor.name} has been added successfully.`,
        })
      }
    } catch (error) {
      console.error("Error adding vendor:", error)
      toast({
        title: "Failed to add vendor",
        description: "There was an error adding your vendor.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      const { success, error, reason } = await deleteTaxClient(id)

      if (!success) {
        toast({
          title: "Cannot delete client",
          description: reason || "This client is in use by one or more loads.",
          variant: "destructive",
        })
        return
      }

      // Remove the client from state
      setClients(clients.filter((client) => client.id !== id))

      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Failed to delete client",
        description: "There was an error deleting the client.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCarrier = async (id: string) => {
    try {
      const { success, error, reason } = await deleteTaxCarrier(id)

      if (!success) {
        toast({
          title: "Cannot delete carrier",
          description: reason || "This carrier is in use by one or more loads.",
          variant: "destructive",
        })
        return
      }

      // Remove the carrier from state
      setCarriers(carriers.filter((carrier) => carrier.id !== id))

      toast({
        title: "Carrier deleted",
        description: "The carrier has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting carrier:", error)
      toast({
        title: "Failed to delete carrier",
        description: "There was an error deleting the carrier.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVendor = async (id: string) => {
    try {
      const { success, error, reason } = await deleteTaxVendor(id)

      if (!success) {
        toast({
          title: "Cannot delete vendor",
          description: reason || "This vendor is in use by one or more ITCs.",
          variant: "destructive",
        })
        return
      }

      // Remove the vendor from state
      setVendors(vendors.filter((vendor) => vendor.id !== id))

      toast({
        title: "Vendor deleted",
        description: "The vendor has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting vendor:", error)
      toast({
        title: "Failed to delete vendor",
        description: "There was an error deleting the vendor.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading tax calculator data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator">
        <TabsList className="mb-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="entities">Clients & Carriers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="guide">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-6">
          <EntityManager
            clients={clients}
            carriers={carriers}
            vendors={vendors}
            onAddClient={handleAddClient}
            onAddCarrier={handleAddCarrier}
            onAddVendor={handleAddVendor}
            onDeleteClient={handleDeleteClient}
            onDeleteCarrier={handleDeleteCarrier}
            onDeleteVendor={handleDeleteVendor}
          />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Manage your vendors here. Vendors can be selected when adding ITCs to automatically fill in details like
                HST numbers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vendor Form */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
                  <VendorForm onAddVendor={handleAddVendor} />
                </Card>

                {/* Vendor List */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Your Vendors</h3>
                  <VendorList vendors={vendors} onDeleteVendor={handleDeleteVendor} />
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <AddLoadForm onAddLoad={handleAddLoad} clients={clients} carriers={carriers} lastLoad={lastLoad} />

          <Card className="p-4">
            <LoadsTable
              loads={loads}
              itcs={itcs}
              clients={clients}
              carriers={carriers}
              vendors={vendors}
              onDeleteLoad={handleDeleteLoad}
            />
          </Card>

          <ITCManager itcs={itcs} vendors={vendors} onAddITC={handleAddITC} onDeleteITC={handleDeleteITC} />
        </TabsContent>

        <TabsContent value="guide">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">How the All Tax Calculator Works</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Overview</h3>
                <p>
                  The All Tax Calculator helps freight brokers track and calculate taxes for multiple loads. It follows
                  the principal method for tax calculations where:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>You charge clients a base amount plus tax</li>
                  <li>You pay carriers an "all-in" amount (including tax)</li>
                  <li>You claim Input Tax Credits (ITCs) for the tax paid to carriers</li>
                  <li>You can add additional ITCs separately from your loads</li>
                  <li>You remit the difference between tax collected and ITCs to the CRA</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Database Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Your tax calculator data is now saved to a database, allowing you to access it from any device and
                  keeping your records secure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Calculation Steps</h3>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li>
                    <strong>Client Invoice:</strong>
                    <ul className="list-disc pl-6 mt-1">
                      <li>HST Amount = Base Amount × HST Rate</li>
                      <li>Total Collected = Base Amount + HST Amount</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Carrier Payment:</strong>
                    <ul className="list-disc pl-6 mt-1">
                      <li>Pre-tax Amount = All-in Amount ÷ (1 + HST Rate)</li>
                      <li>HST Paid = All-in Amount - Pre-tax Amount</li>
                    </ul>
                  </li>
                  <li>
                    <strong>HST Payable:</strong>
                    <ul className="list-disc pl-6 mt-1">
                      <li>HST Payable = HST Collected - HST Paid - Additional ITCs</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Profit:</strong>
                    <ul className="list-disc pl-6 mt-1">
                      <li>Profit = Client Base Amount - Carrier Pre-tax Amount</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Using the Calculator</h3>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li>First, add your clients and carriers in the "Clients & Carriers" tab</li>
                  <li>Add your vendors in the "Vendors" tab for easy ITC entry</li>
                  <li>Switch to the "Calculator" tab to add loads</li>
                  <li>Enter the load number and delivery date for each load</li>
                  <li>Select the client and carrier for the load</li>
                  <li>Input the client base amount and carrier all-in amount</li>
                  <li>Select the appropriate province for the tax rate</li>
                  <li>Add any additional ITCs in the separate ITC section below the loads table</li>
                  <li>When adding ITCs, you can select from your saved vendors to auto-fill information</li>
                  <li>View all calculations in the table, including the final HST payable after all ITCs</li>
                  <li>Export to CSV for record keeping or further analysis</li>
                </ol>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Vendor Form Component
function VendorForm({ onAddVendor }: { onAddVendor: (vendor: Vendor) => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [hstNumber, setHstNumber] = useState("")
  const [province, setProvince] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newVendor: Vendor = {
      id: uuidv4(),
      name,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      hstNumber: hstNumber || undefined,
      province: province || undefined,
      category: category || undefined,
    }

    onAddVendor(newVendor)

    // Reset form
    setName("")
    setEmail("")
    setPhone("")
    setAddress("")
    setHstNumber("")
    setProvince("")
    setCategory("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Vendor Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter vendor name"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="vendorProvince">Province (Optional)</Label>
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger id="vendorProvince">
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
        <Label htmlFor="category">Category (Optional)</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Fuel, Office Supplies, Insurance"
        />
      </div>

      <Button type="submit" className="w-full">
        Add Vendor
      </Button>
    </form>
  )
}

// Vendor List Component
function VendorList({ vendors, onDeleteVendor }: { vendors: Vendor[]; onDeleteVendor: (id: string) => void }) {
  if (vendors.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No vendors added yet. Add your first vendor.</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>HST Number</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.hstNumber || "-"}</TableCell>
              <TableCell>{vendor.category || "-"}</TableCell>
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
  )
}
