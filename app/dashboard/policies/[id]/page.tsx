import { Button } from "@/components/ui/button"
import { Pencil, Download, AlertTriangle, FileText, Plus } from "lucide-react"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// This would come from your database in a real app
const getPolicy = (id: string) => {
  const policyId = Number.parseInt(id)

  // Sample policy data
  const policies = [
    {
      id: 101,
      type: "Business Liability",
      client: "Smith & Co.",
      clientId: 1,
      policyNumber: "BL-2023-10156",
      premium: "$1,200/year",
      status: "Active",
      issueDate: "Dec 15, 2022",
      effectiveDate: "Dec 15, 2022",
      expiry: "Dec 15, 2023",
      coverage: "$1,000,000",
      deductible: "$2,500",
      provider: "Global Insurance Co.",
      documents: [
        { id: 301, name: "Policy Document", type: "PDF", uploaded: "Dec 15, 2022" },
        { id: 302, name: "Terms and Conditions", type: "PDF", uploaded: "Dec 15, 2022" },
        { id: 303, name: "Coverage Details", type: "PDF", uploaded: "Dec 15, 2022" },
      ],
      claims: [],
      requirements: [
        { id: 401, name: "Annual Risk Assessment", status: "Completed", date: "Jun 10, 2023" },
        { id: 402, name: "Safety Protocols Document", status: "Pending", date: null },
        { id: 403, name: "Employee Training Records", status: "Completed", date: "May 5, 2023" },
      ],
    },
    {
      id: 104,
      type: "Auto Insurance",
      client: "Sarah Johnson",
      clientId: 2,
      policyNumber: "AU-2022-89076",
      premium: "$960/year",
      status: "Active",
      issueDate: "Sep 5, 2022",
      effectiveDate: "Sep 5, 2022",
      expiry: "Sep 5, 2023",
      coverage: "$500,000",
      deductible: "$500",
      provider: "National Auto Insurance",
      documents: [
        { id: 304, name: "Policy Document", type: "PDF", uploaded: "Sep 5, 2022" },
        { id: 305, name: "Vehicle Details", type: "PDF", uploaded: "Sep 5, 2022" },
      ],
      claims: [
        { id: 501, date: "Jan 15, 2023", status: "Settled", amount: "$1,800", description: "Minor collision repair" },
      ],
      requirements: [
        { id: 404, name: "Vehicle Inspection", status: "Completed", date: "Mar 12, 2023" },
        { id: 405, name: "Driver's Record Update", status: "Completed", date: "Feb 28, 2023" },
      ],
    },
  ]

  return policies.find((policy) => policy.id === policyId)
}

export default function PolicyDetailsPage({ params }: { params: { id: string } }) {
  const policy = getPolicy(params.id)

  if (!policy) {
    notFound()
  }

  const daysUntilExpiry = Math.ceil((new Date(policy.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{policy.type}</h2>
            <Badge variant={policy.status === "Active" ? "default" : "destructive"}>{policy.status}</Badge>
          </div>
          <p className="text-muted-foreground">Policy #{policy.policyNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Policy
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download Policy
          </Button>
        </div>
      </div>

      {isExpiringSoon && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-yellow-800 dark:text-yellow-300">
              This policy is expiring in {daysUntilExpiry} days. Consider contacting the client about renewal.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Policy Information</CardTitle>
            <CardDescription>
              <Link href={`/dashboard/clients/${policy.clientId}`} className="text-primary">
                {policy.client}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Policy Number</div>
              <div className="text-sm">{policy.policyNumber}</div>

              <div className="text-sm font-medium">Status</div>
              <div className="text-sm">{policy.status}</div>

              <div className="text-sm font-medium">Premium</div>
              <div className="text-sm">{policy.premium}</div>

              <div className="text-sm font-medium">Provider</div>
              <div className="text-sm">{policy.provider}</div>

              <div className="text-sm font-medium">Issue Date</div>
              <div className="text-sm">{policy.issueDate}</div>

              <div className="text-sm font-medium">Effective Date</div>
              <div className="text-sm">{policy.effectiveDate}</div>

              <div className="text-sm font-medium">Expiry Date</div>
              <div className="text-sm">{policy.expiry}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Coverage Amount</div>
              <div className="text-sm">{policy.coverage}</div>

              <div className="text-sm font-medium">Deductible</div>
              <div className="text-sm">{policy.deductible}</div>

              <div className="text-sm font-medium">Policy Type</div>
              <div className="text-sm">{policy.type}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="mt-6">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Policy Documents</h3>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <div className="space-y-4">
            {policy.documents.map((doc) => (
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

        <TabsContent value="requirements" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Compliance Requirements</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </div>

          <div className="space-y-4">
            {policy.requirements.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium">{req.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className={`text-sm ${req.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
                        {req.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Completed Date</p>
                      <p className="text-sm text-muted-foreground">{req.date || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Claims History</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              File New Claim
            </Button>
          </div>

          {policy.claims.length > 0 ? (
            <div className="space-y-4">
              {policy.claims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">{claim.date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm text-muted-foreground">{claim.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Amount</p>
                        <p className="text-sm text-muted-foreground">{claim.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">{claim.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground">No claims have been filed for this policy.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">No modification history available for this policy.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
