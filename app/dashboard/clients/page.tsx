import { Button } from "@/components/ui/button"
import { UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

// Sample client data
const clients = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    type: "Business",
    policies: 3,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 234-5678",
    type: "Individual",
    policies: 1,
  },
  {
    id: 3,
    name: "ABC Corporation",
    email: "contact@abccorp.com",
    phone: "(555) 345-6789",
    type: "Business",
    policies: 5,
  },
  {
    id: 4,
    name: "Michael Brown",
    email: "mike.brown@example.com",
    phone: "(555) 456-7890",
    type: "Individual",
    policies: 2,
  },
  { id: 5, name: "XYZ Industries", email: "info@xyzind.com", phone: "(555) 567-8901", type: "Business", policies: 4 },
]

export default function ClientsPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-8" />
        </div>
      </div>

      {/* Clients list */}
      <div className="grid gap-4">
        {clients.map((client) => (
          <Link href={`/dashboard/clients/${client.id}`} key={client.id}>
            <Card className="p-4 hover:bg-accent cursor-pointer">
              <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.type}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm">{client.email}</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm">{client.policies} Policies</p>
                </div>
                <div className="text-right sm:text-left md:text-right">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
