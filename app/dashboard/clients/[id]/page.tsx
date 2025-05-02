import { Button } from "@/components/ui/button"
import { Pencil, Plus, Download } from "lucide-react"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// This would come from your database in a real app
const getClient = (id: string) => {
  const clientId = Number.parseInt(id)

  // Sample client data
  const clients = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      type: "Business",
      company: "Smith & Co.",
      address: "123 Business Ave, Suite 100, New York, NY 10001",
      policies: [
        { id: 101, type: "Business Liability", premium: "$1,200/year", status: "Active", expiry: "Dec 15, 2023" },
        { id: 102, type: "Property Insurance", premium: "$2,500/year", status: "Active", expiry: "Jan 10, 2024" },
        { id: 103, type: "Workers' Compensation", premium: "$3,800/year", status: "Active", expiry: "Nov 20, 2023" },
      ],
      documents: [
        { id: 201, name: "Business License", type: "PDF", uploaded: "Jan 15, 2023" },
        { id: 202, name: "Risk Assessment", type: "PDF", uploaded: "Feb 28, 2023" },
        { id: 203, name: "Claims History", type: "PDF", uploaded: "Mar 10, 2023" },
      ],
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 234-5678",
      type: "Individual",
      address: "456 Resident St, Apt 303, Chicago, IL 60601",
      policies: [{ id: 104, type: "Auto Insurance", premium: "$960/year", status: "Active", expiry: "Sep 5, 2023" }],
      documents: [
        { id: 204, name: "Driver's License", type: "PDF", uploaded: "Apr 5, 2023" },
        { id: 205, name: "Vehicle Registration", type: "PDF", uploaded: "Apr 5, 2023" },
      ],
    },
  ]

  return clients.find((client) => client.id === clientId)
}

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const client = getClient(params.id)

  if (!client) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Type</div>
              <div className="text-sm">{client.type}</div>

              <div className="text-sm font-medium">Email</div>
              <div className="text-sm">{client.email}</div>

              <div className="text-sm font-medium">Phone</div>
              <div className="text-sm">{client.phone}</div>

              {client.company && (
                <>
                  <div className="text-sm font-medium">Company</div>
                  <div className="text-sm">{client.company}</div>
                </>
              )}

              <div className="text-sm font-medium">Address</div>
              <div className="text-sm">{client.address}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Total Policies</div>
              <div className="text-sm">{client.policies.length}</div>

              <div className="text-sm font-medium">Active Policies</div>
              <div className="text-sm">{client.policies.filter((p) => p.status === "Active").length}</div>

              <div className="text-sm font-medium">Documents</div>
              <div className="text-sm">{client.documents.length}</div>

              <div className="text-sm font-medium">Next Renewal</div>
              <div className="text-sm">
                {client.policies.reduce((earliest, policy) => {
                  return earliest === "None" || new Date(policy.expiry) < new Date(earliest) ? policy.expiry : earliest
                }, "None")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="mt-6">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Insurance Policies</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>

          <div className="space-y-4">
            {client.policies.map((policy) => (
              <Card key={policy.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">{policy.type}</p>
                      <p className="text-sm text-muted-foreground">Policy #{policy.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Premium</p>
                      <p className="text-sm text-muted-foreground">{policy.premium}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className={`text-sm ${policy.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                        {policy.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expiry</p>
                      <p className="text-sm text-muted-foreground">{policy.expiry}</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Link href={`/dashboard/policies/${policy.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Client Documents</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <div className="space-y-4">
            {client.documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uploaded</p>
                      <p className="text-sm text-muted-foreground">{doc.uploaded}</p>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">No claims history for this client.</p>
            <Button variant="outline" className="mt-4">
              Add New Claim
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">No notes for this client.</p>
            <Button variant="outline" className="mt-4">
              Add Note
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
