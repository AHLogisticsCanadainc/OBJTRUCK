import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarrierList } from "@/components/carriers/carrier-list"
import { SystemCarriersTable } from "@/components/carrier-lookup/system-carriers-table"

export default function CarriersPage() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="my-carriers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-carriers">My Carriers</TabsTrigger>
          <TabsTrigger value="all-carriers">All Carriers In System</TabsTrigger>
        </TabsList>
        <TabsContent value="my-carriers">
          <CarrierList />
        </TabsContent>
        <TabsContent value="all-carriers">
          <SystemCarriersTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
