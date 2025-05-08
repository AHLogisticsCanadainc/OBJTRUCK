"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Truck, Phone, Mail, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { toggleCarrierStatus } from "@/lib/carrier-service"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Carrier } from "@/types/carrier-types"

interface CarrierCardProps {
  carrier: Carrier
  onRefresh: () => void
}

export function CarrierCard({ carrier, onRefresh }: CarrierCardProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = () => {
    router.push(`/dashboard/carriers/${carrier.id}`)
  }

  const handleToggleStatus = async () => {
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
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold truncate">{carrier.company_name}</h3>
            {carrier.dba_name && <p className="text-sm text-muted-foreground">DBA: {carrier.dba_name}</p>}
          </div>
          <Badge variant={carrier.active ? "default" : "outline"}>{carrier.active ? "Active" : "Inactive"}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>MC#: {carrier.mc_number || "N/A"}</span>
            {carrier.usdot && <span className="ml-2">USDOT: {carrier.usdot}</span>}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{carrier.main_contact_phone || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{carrier.main_contact_email || "N/A"}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0 border-t">
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleStatus}>
              {carrier.active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
