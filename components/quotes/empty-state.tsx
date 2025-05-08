import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">No quotes found.</p>
        <p className="text-muted-foreground text-center text-sm">Create your first quote to get started.</p>
      </CardContent>
    </Card>
  )
}
