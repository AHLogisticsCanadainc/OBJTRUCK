"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, RefreshCw } from "lucide-react"
import { ProvinceSelector } from "./province-selector"
import type { TaxCalculationInput } from "./types"
import { PROVINCES } from "./constants"

interface InputFormProps {
  onCalculate: (input: TaxCalculationInput) => void
  onReset: () => void
}

export function InputForm({ onCalculate, onReset }: InputFormProps) {
  const [clientBaseAmount, setClientBaseAmount] = useState<string>("")
  const [carrierAllInAmount, setCarrierAllInAmount] = useState<string>("")
  const [taxRate, setTaxRate] = useState<string>("13")
  const [province, setProvince] = useState<string>("ON")
  const [additionalITCs, setAdditionalITCs] = useState<string>("")

  // Update tax rate when province changes
  const handleProvinceChange = (value: string) => {
    setProvince(value)
    const selectedProvince = PROVINCES.find((p) => p.code === value)
    if (selectedProvince) {
      setTaxRate(selectedProvince.rate.toString())
    }
  }

  // Ensure tax rate is updated when province changes
  useEffect(() => {
    const selectedProvince = PROVINCES.find((p) => p.code === province)
    if (selectedProvince && taxRate !== selectedProvince.rate.toString()) {
      setTaxRate(selectedProvince.rate.toString())
    }
  }, [province, taxRate])

  const handleCalculate = () => {
    if (!clientBaseAmount || !carrierAllInAmount) return

    onCalculate({
      clientBaseAmount: Number.parseFloat(clientBaseAmount),
      carrierAllInAmount: Number.parseFloat(carrierAllInAmount),
      taxRate: Number.parseFloat(taxRate) / 100,
      additionalITCs: additionalITCs ? Number.parseFloat(additionalITCs) : 0,
    })
  }

  const handleReset = () => {
    setClientBaseAmount("")
    setCarrierAllInAmount("")
    setTaxRate("13")
    setProvince("ON")
    setAdditionalITCs("")
    onReset()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-base-amount">Client Base Amount ($)</Label>
        <Input
          id="client-base-amount"
          type="number"
          placeholder="Enter client base amount"
          value={clientBaseAmount}
          onChange={(e) => setClientBaseAmount(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">The amount you charge the client before tax.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="carrier-all-in-amount">Carrier All-in Amount ($)</Label>
        <Input
          id="carrier-all-in-amount"
          type="number"
          placeholder="Enter carrier all-in amount"
          value={carrierAllInAmount}
          onChange={(e) => setCarrierAllInAmount(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">The total amount you pay to the carrier (including tax).</p>
      </div>

      <ProvinceSelector value={province} onChange={handleProvinceChange} provinces={PROVINCES} />

      <div className="space-y-2">
        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
        <Input id="tax-rate" type="number" step="0.001" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        <p className="text-xs text-muted-foreground">
          Default rate is set based on selected province, but can be adjusted if needed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional-itcs">Additional ITCs ($) (Optional)</Label>
        <Input
          id="additional-itcs"
          type="number"
          placeholder="Enter additional ITCs"
          value={additionalITCs}
          onChange={(e) => setAdditionalITCs(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Additional Input Tax Credits from other business expenses.</p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleCalculate}>
          <Calculator className="mr-2 h-4 w-4" />
          Calculate
        </Button>
      </div>
    </div>
  )
}
