"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Search, Plus, Filter, Calendar, MapPin, Package, Clock } from "lucide-react"

export default function LoadsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data for loads
  const loads = [
    {
      id: "L-2023-001",
      customer: "Acme Corporation",
      origin: "Toronto, ON",
      destination: "Montreal, QC",
      pickupDate: "2023-11-20",
      deliveryDate: "2023-11-22",
      status: "In Transit",
      carrier: "Express Logistics",
      weight: "2,500 lbs",
    },
    {
      id: "L-2023-002",
      customer: "Global Shipping Inc",
      origin: "Vancouver, BC",
      destination: "Calgary, AB",
      pickupDate: "2023-11-22",
      deliveryDate: "2023-11-25",
      status: "Scheduled",
      carrier: "Mountain Transport",
      weight: "4,200 lbs",
    },
    {
      id: "L-2023-003",
      customer: "Tech Solutions Ltd",
      origin: "Ottawa, ON",
      destination: "Quebec City, QC",
      pickupDate: "2023-11-18",
      deliveryDate: "2023-11-19",
      status: "Delivered",
      carrier: "Fast Freight",
      weight: "1,800 lbs",
    },
    {
      id: "L-2023-004",
      customer: "Fresh Produce Co",
      origin: "Kelowna, BC",
      destination: "Edmonton, AB",
      pickupDate: "2023-11-25",
      deliveryDate: "2023-11-27",
      status: "Scheduled",
      carrier: "Cool Transport LLC",
      weight: "3,600 lbs",
    },
  ]

  // Filter loads based on search term
  const filteredLoads = loads.filter(
    (load) =>
      load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-4 md:p-6 pt-20 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Loads Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your shipments</p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Load
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-4">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5 text-primary" />
                Active Loads
              </CardTitle>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search loads..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All Loads</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="in-transit">In Transit</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Load ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Carrier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No loads found matching your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLoads.map((load) => (
                          <TableRow key={load.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{load.id}</TableCell>
                            <TableCell>{load.customer}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.origin}</span>
                                <span className="mx-1">→</span>
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.destination}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center text-xs">
                                  <Calendar className="h-3 w-3 mr-1 text-green-500" />
                                  Pickup: {load.pickupDate}
                                </div>
                                <div className="flex items-center text-xs mt-1">
                                  <Calendar className="h-3 w-3 mr-1 text-red-500" />
                                  Delivery: {load.deliveryDate}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <LoadStatusBadge status={load.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{load.carrier}</span>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Package className="h-3 w-3 mr-1" />
                                  {load.weight}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="scheduled">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Load ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Carrier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoads
                        .filter((load) => load.status === "Scheduled")
                        .map((load) => (
                          <TableRow key={load.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{load.id}</TableCell>
                            <TableCell>{load.customer}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.origin}</span>
                                <span className="mx-1">→</span>
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.destination}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center text-xs">
                                  <Calendar className="h-3 w-3 mr-1 text-green-500" />
                                  Pickup: {load.pickupDate}
                                </div>
                                <div className="flex items-center text-xs mt-1">
                                  <Calendar className="h-3 w-3 mr-1 text-red-500" />
                                  Delivery: {load.deliveryDate}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <LoadStatusBadge status={load.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{load.carrier}</span>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Package className="h-3 w-3 mr-1" />
                                  {load.weight}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="in-transit">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Load ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Carrier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoads
                        .filter((load) => load.status === "In Transit")
                        .map((load) => (
                          <TableRow key={load.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{load.id}</TableCell>
                            <TableCell>{load.customer}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.origin}</span>
                                <span className="mx-1">→</span>
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.destination}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center text-xs">
                                  <Calendar className="h-3 w-3 mr-1 text-green-500" />
                                  Pickup: {load.pickupDate}
                                </div>
                                <div className="flex items-center text-xs mt-1">
                                  <Calendar className="h-3 w-3 mr-1 text-red-500" />
                                  Delivery: {load.deliveryDate}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <LoadStatusBadge status={load.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{load.carrier}</span>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Package className="h-3 w-3 mr-1" />
                                  {load.weight}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="delivered">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Load ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Carrier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoads
                        .filter((load) => load.status === "Delivered")
                        .map((load) => (
                          <TableRow key={load.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{load.id}</TableCell>
                            <TableCell>{load.customer}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.origin}</span>
                                <span className="mx-1">→</span>
                                <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="truncate max-w-[100px]">{load.destination}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center text-xs">
                                  <Calendar className="h-3 w-3 mr-1 text-green-500" />
                                  Pickup: {load.pickupDate}
                                </div>
                                <div className="flex items-center text-xs mt-1">
                                  <Calendar className="h-3 w-3 mr-1 text-red-500" />
                                  Delivery: {load.deliveryDate}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <LoadStatusBadge status={load.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{load.carrier}</span>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Package className="h-3 w-3 mr-1" />
                                  {load.weight}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper component for load status badges
function LoadStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Scheduled":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
        >
          <Clock className="mr-1 h-3 w-3" />
          Scheduled
        </Badge>
      )
    case "In Transit":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
        >
          <Truck className="mr-1 h-3 w-3" />
          In Transit
        </Badge>
      )
    case "Delivered":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
        >
          <Package className="mr-1 h-3 w-3" />
          Delivered
        </Badge>
      )
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
        >
          {status}
        </Badge>
      )
  }
}
