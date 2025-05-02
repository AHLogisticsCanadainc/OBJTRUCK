import { Button } from "@/components/ui/button"
import { Plus, Search, FileText, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample documents data
const documents = [
  {
    id: 301,
    name: "Business Liability Policy",
    client: "Smith & Co.",
    clientId: 1,
    policyId: 101,
    type: "Policy Document",
    fileType: "PDF",
    uploaded: "Dec 15, 2022",
    size: "2.4 MB",
  },
  {
    id: 302,
    name: "Terms and Conditions",
    client: "Smith & Co.",
    clientId: 1,
    policyId: 101,
    type: "Legal",
    fileType: "PDF",
    uploaded: "Dec 15, 2022",
    size: "1.8 MB",
  },
  {
    id: 303,
    name: "Coverage Details",
    client: "Smith & Co.",
    clientId: 1,
    policyId: 101,
    type: "Policy Document",
    fileType: "PDF",
    uploaded: "Dec 15, 2022",
    size: "1.2 MB",
  },
  {
    id: 304,
    name: "Auto Insurance Policy",
    client: "Sarah Johnson",
    clientId: 2,
    policyId: 104,
    type: "Policy Document",
    fileType: "PDF",
    uploaded: "Sep 5, 2022",
    size: "1.9 MB",
  },
  {
    id: 305,
    name: "Vehicle Registration",
    client: "Sarah Johnson",
    clientId: 2,
    policyId: 104,
    type: "Supporting Document",
    fileType: "PDF",
    uploaded: "Sep 5, 2022",
    size: "0.8 MB",
  },
  {
    id: 201,
    name: "Business License",
    client: "Smith & Co.",
    clientId: 1,
    policyId: null,
    type: "Client Document",
    fileType: "PDF",
    uploaded: "Jan 15, 2023",
    size: "1.5 MB",
  },
]

export default function DocumentsPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-8" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="policy">Policy Documents</SelectItem>
              <SelectItem value="client">Client Documents</SelectItem>
              <SelectItem value="legal">Legal Documents</SelectItem>
              <SelectItem value="supporting">Supporting Documents</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="1">Smith & Co.</SelectItem>
              <SelectItem value="2">Sarah Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents list */}
      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="p-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              <div className="col-span-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{document.name}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{document.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Client</p>
                <p className="text-sm text-muted-foreground">{document.client}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Uploaded</p>
                <p className="text-sm text-muted-foreground">{document.uploaded}</p>
              </div>
              <div>
                <p className="text-sm font-medium">File Size</p>
                <p className="text-sm text-muted-foreground">{document.size}</p>
              </div>
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
