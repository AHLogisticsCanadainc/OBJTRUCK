"use client"

import { AllTaxCalculator } from "@/components/tools/all-tax-calculator/all-tax-calculator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AllTaxCalculatorPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.push("/dashboard/tools")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tax Calculator</h1>
          <p className="text-muted-foreground mt-1">
            Track and calculate taxes for multiple loads in spreadsheet format
          </p>
        </div>
      </div>

      <AllTaxCalculator />
    </div>
  )
}
