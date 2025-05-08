"use client"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, ChevronRight, FileSpreadsheet } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ToolsPage() {
  const router = useRouter()

  const tools = [
    {
      id: "tax-calculator",
      title: "EST TAX Calculator",
      description: "Calculate estimated taxes for carriers and loads",
      icon: Calculator,
      action: () => router.push("/dashboard/tools/tax-calculator"),
    },
    {
      id: "all-tax-calculator",
      title: "All Tax Calculator",
      description: "Track and calculate taxes for multiple loads in spreadsheet format",
      icon: FileSpreadsheet,
      action: () => router.push("/dashboard/tools/all-tax-calculator"),
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
        <p className="text-muted-foreground mt-2">Specialized tools to help with your logistics operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-md bg-[#ed1c23]/10 flex items-center justify-center">
                  <tool.icon className="h-5 w-5 text-[#ed1c23]" />
                </div>
              </div>
              <CardTitle className="mt-4">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button onClick={tool.action} variant="outline" className="w-full justify-between">
                Open Tool
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
