import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample policies data
const policies = [
  {
    id: 101,
    type: "Business Liability",
    client: "Smith & Co.",
    clientId: 1,
    premium: "$1,200/year",
    status: "Active",
    expiry: "Dec 15, 2023",
  },
  {
    id: 102,
    type: "Property Insurance",
    client: "Smith & Co.",
    clientId: 1,
    premium: "$2,500/year",
    status: "Active",
    expiry: "Jan 10, 2024",
  },
  {
    id: 103,
    type: "Workers' Compensation",
    client: "Smith & Co.",
    clientId: 1,
    premium: "$3,800/year",
    status: "Active",
    expiry: "Nov 20, 2023",
  },
  {
    id: 104,
    type: "Auto Insurance",
    client: "Sarah Johnson",
    clientId: 2,
    premium: "$960/year",
    status: "Active",
    expiry: "Sep 5, 2023",
  },
  {
    id: 105,
    type: "Health Insurance",
    client: "Michael Brown",
    clientId: 4,
    premium: "$4,200/year",
    status: "Expired",
    expiry: "Jul 30, 2023",
  },
]

export default function PoliciesPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Policies</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Policy
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search policies..." className="pl-8" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Policies list */}
      <div className="grid gap-4">
        {policies.map((policy) => (
          <Link href={`/dashboard/policies/${policy.id}`} key={policy.id}>
            <Card className="p-4 hover:bg-accent cursor-pointer">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                <div>
                  <p className="text-sm font-medium">{policy.type}</p>
                  <p className="text-sm text-muted-foreground">Policy #{policy.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm text-muted-foreground">{policy.client}</p>
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
                <div className="text-right">
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
