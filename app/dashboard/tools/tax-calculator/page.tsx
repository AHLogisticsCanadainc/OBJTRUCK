"use client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { TaxCalculator } from "@/components/tools/tax-calculator/tax-calculator"

export default function TaxCalculatorPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-8">
        <Button variant="ghost" className="mr-4 p-0 h-auto" onClick={() => router.push("/dashboard/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EST TAX Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate estimated taxes and profit for freight brokerage</p>
        </div>
      </div>

      <TaxCalculator />
    </div>
  )
}
