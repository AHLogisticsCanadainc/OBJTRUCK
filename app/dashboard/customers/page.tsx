"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"
import { useClients } from "@/hooks/use-clients"
import { ClientForm } from "@/components/clients/client-form"
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog"
import { CustomerDetailsDialog } from "@/components/clients/customer-details-dialog"
import type { Client } from "@/types/clients"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CustomersPage() {
  const { clients, isLoading, addClient, updateClient, deleteClient, refreshClients } = useClients()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)

  // Filter clients based on search term
  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.company_name.toLowerCase().includes(searchLower) ||
      client.contact_name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.phone_number && client.phone_number.includes(searchTerm)) ||
      (client.address_city && client.address_city.toLowerCase().includes(searchLower))
    )
  })

  // Handle adding a new client
  const handleAddClient = async (clientData: Partial<Client>) => {
    try {
      await addClient(clientData)
      setIsAddClientOpen(false)
      await refreshClients() // Refresh the client list
    } catch (error) {
      console.error("Error adding client:", error)
      // Error is handled in the addClient function
    }
  }

  // Handle editing a client
  const handleEditClient = async (clientData: Partial<Client>) => {
    if (editingClient) {
      try {
        await updateClient(editingClient.id, clientData)
        setEditingClient(null)
        await refreshClients() // Refresh the client list

        // If we were viewing this client, update the viewing client with new data
        if (viewingClient && viewingClient.id === editingClient.id) {
          const updatedClient = { ...viewingClient, ...clientData }
          setViewingClient(updatedClient as Client)
        }
      } catch (error) {
        console.error("Error updating client:", error)
        // Error is handled in the updateClient function
      }
    }
  }

  // Handle deleting a client
  const handleDeleteClient = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete.id)
        setIsDeleteDialogOpen(false)
        setClientToDelete(null)

        // If we were viewing this client, close the details dialog
        if (viewingClient && viewingClient.id === clientToDelete.id) {
          setViewingClient(null)
        }

        await refreshClients() // Refresh the client list
      } catch (error) {
        console.error("Error deleting client:", error)
        // Error is handled in the deleteClient function and displayed in the dialog
      }
    }
  }

  // Format phone number for display
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "N/A"
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
    }
    return phone
  }

  // Handle viewing client details
  const handleViewClient = (client: Client) => {
    setViewingClient(client)
  }

  // Handle edit from details view
  const handleEditFromDetails = () => {
    setEditingClient(viewingClient)
    setViewingClient(null)
  }

  if (isLoading) {
    return (
      <div className="p-6 pt-20">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Customers Management</h1>
        <LoadingSpinner text="Loading customers..." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 pt-20 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customers Management</h1>
          <p className="text-muted-foreground mt-1">Manage your customer accounts</p>
        </div>

        <Button onClick={() => setIsAddClientOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Customers ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? (
                <p>No customers found matching "{searchTerm}"</p>
              ) : (
                <p>No customers found. Add your first customer to get started.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewClient(client)}
                    >
                      <TableCell className="font-medium">{client.company_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{client.contact_name}</span>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3 mr-1" />
                            {formatPhoneNumber(client.phone_number)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          {client.address_city && client.address_state_province
                            ? `${client.address_city}, ${client.address_state_province}`
                            : client.address_city || client.address_state_province || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <CreditCard className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            {client.payment_terms || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Credit: {client.credit_limit ? `$${client.credit_limit.toLocaleString()}` : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={client.active ? "outline" : "secondary"}
                          className={
                            client.active
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                              : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
                          }
                        >
                          {client.active ? (
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                          )}
                          {client.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <div
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                              onClick={(e) => e.stopPropagation()} // Prevent row click
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation() // Prevent row click
                                handleViewClient(client)
                              }}
                              className="cursor-pointer flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation() // Prevent row click
                                setEditingClient(client)
                              }}
                              className="cursor-pointer flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer flex items-center"
                              onClick={(e) => {
                                e.stopPropagation() // Prevent row click
                                setClientToDelete(client)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Client Dialog */}
      <ClientForm
        open={isAddClientOpen}
        onOpenChange={setIsAddClientOpen}
        onSubmit={handleAddClient}
        title="Add Customer"
        description="Add a new customer to your system."
        submitLabel="Add Customer"
      />

      {/* Edit Client Dialog */}
      <ClientForm
        open={!!editingClient}
        onOpenChange={(open) => {
          if (!open) setEditingClient(null)
        }}
        onSubmit={handleEditClient}
        client={editingClient}
        title="Edit Customer"
        description="Update customer information."
        submitLabel="Update Customer"
      />

      {/* View Client Details Dialog */}
      <CustomerDetailsDialog
        open={!!viewingClient}
        onOpenChange={(open) => {
          if (!open) setViewingClient(null)
        }}
        client={viewingClient}
        onEdit={handleEditFromDetails}
      />

      {/* Delete Client Dialog */}
      <DeleteClientDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteClient}
        clientName={clientToDelete?.company_name || ""}
      />
    </div>
  )
}
