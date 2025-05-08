"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputForm } from "./input-form"
import { ResultsDisplay } from "./results-display"
import type { TaxCalculationInput, TaxCalculationResult } from "./types"
import { calculateTax } from "./calculation-logic"

export function TaxCalculator() {
  const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null)
  const [currentTaxRate, setCurrentTaxRate] = useState<number>(0.13) // Default to 13%

  const handleCalculate = (input: TaxCalculationInput) => {
    setCurrentTaxRate(input.taxRate)
    const result = calculateTax(input)
    setCalculationResult(result)
  }

  const handleReset = () => {
    setCalculationResult(null)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="guide">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Values</CardTitle>
                <CardDescription>Enter the amounts and select tax details</CardDescription>
              </CardHeader>
              <CardContent>
                <InputForm onCalculate={handleCalculate} onReset={handleReset} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>Tax and profit breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsDisplay result={calculationResult} taxRate={currentTaxRate} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>How the EST TAX Calculator Works</CardTitle>
              <CardDescription>Understanding the freight brokerage tax calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <p>
                  This calculator helps freight brokers determine their profit and tax obligations when acting as a
                  principal. It follows CRA guidelines for GST/HST calculations.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Step 1: Client Invoice</h3>
                <p>
                  You charge the client a base amount plus HST/GST. The calculator determines the tax collected and
                  total amount.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Tax Collected = Base Amount × Tax Rate</li>
                  <li>Total Collected = Base Amount + Tax Collected</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Step 2: Carrier Payment</h3>
                <p>
                  You pay the carrier an "all-in" amount that includes their fee and tax. The calculator separates these
                  components.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Pre-tax Amount = All-in Amount ÷ (1 + Tax Rate)</li>
                  <li>Tax Paid (ITC) = All-in Amount - Pre-tax Amount</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Step 3: Tax Payable</h3>
                <p>
                  The tax you owe is the difference between what you collected and what you can claim as an Input Tax
                  Credit (ITC).
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Tax Payable = Tax Collected - Tax Paid (ITC)</li>
                  <li>Final Tax Payable = Tax Payable - Additional ITCs</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Step 4: Profit Calculation</h3>
                <p>
                  Your profit is the difference between what you charge the client (before tax) and what you pay the
                  carrier (before tax).
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Profit = Client Base Amount - Carrier Pre-tax Amount</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-md mt-4">
                <h3 className="font-semibold text-lg mb-2">Example</h3>
                <p>For a load where you charge the client $1,750 + 13% HST and pay the carrier $1,750 "all-in":</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Client: $1,750 base + $227.50 HST = $1,977.50 total</li>
                  <li>Carrier: $1,750 all-in = $1,548.67 pre-tax + $201.33 HST</li>
                  <li>Tax Payable: $227.50 - $201.33 = $26.17</li>
                  <li>Profit: $1,750 - $1,548.67 = $201.33</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
