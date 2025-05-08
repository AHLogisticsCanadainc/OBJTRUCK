"use client"

import { Download, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { TaxCalculationResult } from "./types"
import { formatCurrency, formatPercentage } from "./calculation-logic"

interface ResultsDisplayProps {
  result: TaxCalculationResult | null
  taxRate: number
}

export function ResultsDisplay({ result, taxRate }: ResultsDisplayProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Enter values and click Calculate to see results</p>
      </div>
    )
  }

  const handleExport = () => {
    // Create a text representation of the calculation
    const content = `
EST TAX Calculator Results
-------------------------
Date: ${new Date().toLocaleDateString()}

CLIENT INVOICE
Client Base Amount: ${formatCurrency(result.clientBaseAmount)}
Tax Rate: ${formatPercentage(taxRate)}
Tax Collected: ${formatCurrency(result.clientTaxCollected)}
Total Collected: ${formatCurrency(result.clientTotalCollected)}

CARRIER PAYMENT
Carrier All-in Amount: ${formatCurrency(result.carrierAllInAmount)}
Carrier Pre-tax Amount: ${formatCurrency(result.carrierPreTaxAmount)}
Carrier Tax Paid (ITC): ${formatCurrency(result.carrierTaxPaid)}

TAX CALCULATIONS
Tax Payable: ${formatCurrency(result.taxPayable)}
Final Tax Payable: ${formatCurrency(result.finalTaxPayable)}

PROFIT
Profit: ${formatCurrency(result.profit)}
    `.trim()

    // Create a blob and download it
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tax-calculation-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-3">Client Invoice</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Amount:</span>
            <span className="font-medium">{formatCurrency(result.clientBaseAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax Rate:</span>
            <span className="font-medium">{formatPercentage(taxRate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax Collected:</span>
            <span className="font-medium">{formatCurrency(result.clientTaxCollected)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total Collected:</span>
            <span>{formatCurrency(result.clientTotalCollected)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-3">Carrier Payment</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">All-in Amount:</span>
            <span className="font-medium">{formatCurrency(result.carrierAllInAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pre-tax Amount:</span>
            <span className="font-medium">{formatCurrency(result.carrierPreTaxAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax Paid (ITC):</span>
            <span className="font-medium">{formatCurrency(result.carrierTaxPaid)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-3">Tax Calculations</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax Collected:</span>
            <span className="font-medium">{formatCurrency(result.clientTaxCollected)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax Paid (ITC):</span>
            <span className="font-medium">-{formatCurrency(result.carrierTaxPaid)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax Payable:</span>
            <span className="font-medium">{formatCurrency(result.taxPayable)}</span>
          </div>
          {result.finalTaxPayable !== result.taxPayable && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Additional ITCs:</span>
                <span className="font-medium">-{formatCurrency(result.taxPayable - result.finalTaxPayable)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Final Tax Payable:</span>
                <span>{formatCurrency(result.finalTaxPayable)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-3">Profit</h3>
        <div className="flex justify-between text-lg font-bold">
          <span>Profit:</span>
          <span>{formatCurrency(result.profit)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Profit = Client Base Amount - Carrier Pre-tax Amount</p>
      </div>

      <Button variant="outline" className="w-full mt-4" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export Calculation
      </Button>
    </div>
  )
}
