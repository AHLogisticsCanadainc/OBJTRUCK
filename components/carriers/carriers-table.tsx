"use client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Eye, Edit, MoreHorizontal, CheckCircle, XCircle } from "lucide-react"
import { toggleCarrierStatus } from "@/lib/carrier-service"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Carrier } from "@/types/carrier-types"

interface CarriersTableProps {
  carriers: Carrier[]
  onRefresh: () => void
}

export function CarriersTable({ carriers, onRefresh }: CarriersTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleView = (id: number) => {
    router.push(`/dashboard/carriers/${id}`)
  }

  const handleEdit = (id: number) => {
    router.push(`/dashboard/carriers/${id}/edit`)
  }

  const handleToggleStatus = async (carrier: Carrier) => {
    try {
      await toggleCarrierStatus(carrier.id, !carrier.active)
      toast({
        title: `Carrier ${carrier.active ? "deactivated" : "activated"}`,
        description: `${carrier.company_name} has been ${carrier.active ? "deactivated" : "activated"} successfully.`,
      })
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update carrier status.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>MC Number</TableHead>
            <TableHead>USDOT</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carriers.map((carrier) => (
            <TableRow key={carrier.id}>
              <TableCell className="font-medium">
                {carrier.company_name}
                {carrier.dba_name && <div className="text-xs text-muted-foreground">DBA: {carrier.dba_name}</div>}
              </TableCell>
              <TableCell>{carrier.mc_number || "N/A"}</TableCell>
              <TableCell>{carrier.usdot || "N/A"}</TableCell>
              <TableCell>
                <div>{carrier.main_contact_name}</div>
                <div className="text-xs text-muted-foreground">{carrier.main_contact_phone}</div>
              </TableCell>
              <TableCell>
                <Badge variant={carrier.active ? "default" : "outline"}>{carrier.active ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleView(carrier.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(carrier.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleStatus(carrier)}>
                        {carrier.active ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
