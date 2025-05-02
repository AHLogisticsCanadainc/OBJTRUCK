import { Button } from "@/components/ui/button"
import { Plus, Search, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Sample compliance data
const complianceItems = [
  {
    id: 401,
    name: "Annual Risk Assessment",
    client: "Smith & Co.",
    clientId: 1,
    policyId: 101,
    status: "Completed",
    dueDate: "Jun 10, 2023",
    completedDate: "Jun 8, 2023",
    priority: "High",
  },
  {
    id: 402,
    name: "Safety Protocols Document",
    client: "Smith & Co.",
    clientId: 1,
    policyId: 101,
    status: "Pending",
    dueDate: "Aug 30, 2023",
    completedDate: null,
    priority: "Medium",
  },
  {
    id: 403,
    name: "Employee Training Records",
    client: "Smith & Co.",
    clientId: 1,
    policyId: 101,
    status: "Completed",
    dueDate: "May 5, 2023",
    completedDate: "May 5, 2023",
    priority: "Medium",
  },
  {
    id: 404,
    name: "Vehicle Inspection",
    client: "Sarah Johnson",
    clientId: 2,
    policyId: 104,
    status: "Completed",
    dueDate: "Mar 12, 2023",
    completedDate: "Mar 12, 2023",
    priority: "Medium",
  },
  {
    id: 405,
    name: "Driver's Record Update",
    client: "Sarah Johnson",
    clientId: 2,
    policyId: 104,
    status: "Completed",
    dueDate: "Feb 28, 2023",
    completedDate: "Feb 28, 2023",
    priority: "Low",
  },
  {
    id: 406,
    name: "Quarterly Business Review",
    client: "ABC Corporation",
    clientId: 3,
    policyId: 106,
    status: "Overdue",
    dueDate: "Jul 15, 2023",
    completedDate: null,
    priority: "High",
  },
]

export default function CompliancePage() {
  const totalItems = complianceItems.length
  const completedItems = complianceItems.filter((item) => item.status === "Completed").length
  const overdueItems = complianceItems.filter((item) => item.status === "Overdue").length
  const pendingItems = complianceItems.filter((item) => item.status === "Pending").length

  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Compliance</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Compliance Item
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{completionPercentage}%</span>
                <Badge
                  variant={
                    completionPercentage > 80 ? "default" : completionPercentage > 50 ? "outline" : "destructive"
                  }
                >
                  {completionPercentage > 80 ? "Good" : completionPercentage > 50 ? "Needs Attention" : "At Risk"}
                </Badge>
              </div>
              <Progress value={completionPercentage} className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{pendingItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold">{overdueItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search compliance items..." className="pl-8" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Compliance items list */}
      <div className="grid gap-4">
        {complianceItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              <div className="col-span-2">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  <Link href={`/dashboard/clients/${item.clientId}`} className="hover:underline">
                    {item.client}
                  </Link>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant={
                    item.status === "Completed" ? "default" : item.status === "Pending" ? "outline" : "destructive"
                  }
                  className="mt-1"
                >
                  {item.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm text-muted-foreground">{item.dueDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Priority</p>
                <p
                  className={`text-sm ${
                    item.priority === "High"
                      ? "text-red-500"
                      : item.priority === "Medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {item.priority}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
