"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BasicInfoSection } from "./basic-info-section"
import { PricingSection } from "./pricing-section"
import { EnvironmentalSection } from "./environmental-section"
import { NotesSection } from "./notes-section"
import { calculateAdjustedMpg, calculateTransitTime, determineLoadType, ensureNumber } from "./utils"
import type { CreateOptionFormProps, OptionFormState } from "./types"

export const CreateOptionForm = ({
  quoteId,
  open,
  onOpenChange,
  onSubmit,
  editOption,
  onClearEdit,
}: CreateOptionFormProps) => {
  const [option, setOption] = useState<OptionFormState>({
    name: "",
    description: "",
    pickup_date: "",
    delivery_date: "",
    total_rate: 0,
    transit_time: "",
    is_recommended: false,
    notes: "",
    status: "pending",
    carrier: "",
    distance: 0,
    weight: 0,
    equipment_type: "",
    co2_emissions: 0,
    trees_needed: 0,
    fuel_cost: 0,
    driver_pay: 0,
    equipment_maintenance: 0,
    overhead_cost: 0,
    insurance_cost: 0,
    overheads_servicecost: 0,
    features: "",
    truckmpg: 0,
    driverratepermile: 0,
    estfuel_needed: 0,
    costperliter: 0,
    carbon_offsetneeded: 0,
    showcost_trasnperency: "",
  })
  const [calculationPerformed, setCalculationPerformed] = useState(false)
  const [manualCostEdit, setManualCostEdit] = useState(false)
  const [distributingCosts, setDistributingCosts] = useState(false)
  const [mpgAdjustmentEnabled, setMpgAdjustmentEnabled] = useState(true)

  // Load edit option
  useEffect(() => {
    if (editOption) {
      setOption(editOption)
    } else {
      setOption({
        name: "",
        description: "",
        pickup_date: "",
        delivery_date: "",
        total_rate: 0,
        transit_time: "",
        is_recommended: false,
        notes: "",
        status: "pending",
        carrier: "",
        distance: 0,
        weight: 0,
        equipment_type: "",
        co2_emissions: 0,
        trees_needed: 0,
        fuel_cost: 0,
        driver_pay: 0,
        equipment_maintenance: 0,
        overhead_cost: 0,
        insurance_cost: 0,
        overheads_servicecost: 0,
        features: "",
        truckmpg: 0,
        driverratepermile: 0,
        estfuel_needed: 0,
        costperliter: 0,
        carbon_offsetneeded: 0,
        showcost_trasnperency: "",
      })
    }
  }, [editOption])

  // Clear edit option
  const clearEdit = () => {
    onClearEdit?.()
  }

  // Calculate transit time
  useEffect(() => {
    const transitTime = calculateTransitTime(option.pickup_date, option.delivery_date)
    if (transitTime) {
      setOption((prev) => ({ ...prev, transit_time: transitTime }))
    }
  }, [option.pickup_date, option.delivery_date])

  // Calculate adjusted MPG
  const adjustedMpg = calculateAdjustedMpg(option.truckmpg, option.weight, mpgAdjustmentEnabled)

  // Determine load type
  const loadType = determineLoadType(option.weight)

  // Calculate estimated fuel needed
  useEffect(() => {
    if (adjustedMpg && option.distance) {
      const fuelNeeded = option.distance / adjustedMpg
      setOption((prev) => ({ ...prev, estfuel_needed: Number(fuelNeeded.toFixed(2)) }))
    } else {
      setOption((prev) => ({ ...prev, estfuel_needed: 0 }))
    }
  }, [adjustedMpg, option.distance])

  // Calculate fuel cost
  useEffect(() => {
    if (option.estfuel_needed && option.costperliter) {
      const fuelCost = option.estfuel_needed * option.costperliter * 3.78541 // liters/gallon
      setOption((prev) => ({ ...prev, fuel_cost: Number(fuelCost.toFixed(2)) }))
    } else {
      setOption((prev) => ({ ...prev, fuel_cost: 0 }))
    }
  }, [option.estfuel_needed, option.costperliter])

  // Calculate driver pay
  useEffect(() => {
    if (option.distance && option.driverratepermile) {
      const driverPay = option.distance * option.driverratepermile
      setOption((prev) => ({ ...prev, driver_pay: Number(driverPay.toFixed(2)) }))
    } else {
      setOption((prev) => ({ ...prev, driver_pay: 0 }))
    }
  }, [option.distance, option.driverratepermile])

  // Calculate CO2 emissions
  useEffect(() => {
    if (option.distance && loadType.emissionRate) {
      const emissionsKg = (option.distance * loadType.emissionRate.kg) / 1000 // Convert kg to metric tons
      setOption((prev) => ({ ...prev, co2_emissions: Number(emissionsKg.toFixed(2)) }))
    } else {
      setOption((prev) => ({ ...prev, co2_emissions: 0 }))
    }
  }, [option.distance, loadType.emissionRate])

  // Calculate trees needed
  useEffect(() => {
    if (option.co2_emissions) {
      setOption((prev) => ({ ...prev, trees_needed: Math.ceil(option.co2_emissions) }))
    } else {
      setOption((prev) => ({ ...prev, trees_needed: 0 }))
    }
  }, [option.co2_emissions])

  // Calculate carbon offset needed
  useEffect(() => {
    if (option.co2_emissions) {
      setOption((prev) => ({ ...prev, carbon_offsetneeded: option.co2_emissions }))
    } else {
      setOption((prev) => ({ ...prev, carbon_offsetneeded: 0 }))
    }
  }, [option.co2_emissions])

  // Calculate estimated total cost
  const estimatedTotalCost = ensureNumber(option.fuel_cost) + ensureNumber(option.driver_pay)

  // Distribute costs
  const distributeCosts = () => {
    if (!option.total_rate || isNaN(option.total_rate)) return

    setDistributingCosts(true)

    // Calculate remaining amount after fuel and driver pay
    const remaining = option.total_rate - estimatedTotalCost

    // Distribute costs based on percentages
    const equipment_maintenance = Number((remaining * 0.35).toFixed(2))
    const insurance_cost = Number((remaining * 0.2).toFixed(2))
    const overhead_cost = Number((remaining * 0.4).toFixed(2))
    const overheads_servicecost = Number((remaining * 0.05).toFixed(2))

    setOption({
      ...option,
      equipment_maintenance,
      insurance_cost,
      overhead_cost,
      overheads_servicecost,
    })

    setDistributingCosts(false)
  }

  // Handle number changes
  const handleNumberChange = (field: string, value: string) => {
    const numValue = Number(value)
    setOption({ ...option, [field]: isNaN(numValue) ? 0 : numValue })
    setCalculationPerformed(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] md:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{editOption ? "Edit Quote Option" : "Create Quote Option"}</DialogTitle>
          <DialogDescription>
            {editOption
              ? "Edit the details of the selected quote option."
              : "Create a new quote option for this quote."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="grid grid-cols-1 gap-6 py-4 px-1">
            <BasicInfoSection
              option={option}
              setOption={setOption}
              adjustedMpg={adjustedMpg}
              mpgAdjustmentEnabled={mpgAdjustmentEnabled}
              setMpgAdjustmentEnabled={setMpgAdjustmentEnabled}
              estimatedTotalCost={estimatedTotalCost}
              handleNumberChange={handleNumberChange}
            />

            <PricingSection
              option={option}
              setOption={setOption}
              calculationPerformed={calculationPerformed}
              estimatedTotalCost={estimatedTotalCost}
              manualCostEdit={manualCostEdit}
              setManualCostEdit={setManualCostEdit}
              distributingCosts={distributingCosts}
              handleNumberChange={handleNumberChange}
            />

            <EnvironmentalSection
              option={option}
              loadType={loadType}
              adjustedMpg={adjustedMpg}
              mpgAdjustmentEnabled={mpgAdjustmentEnabled}
              setMpgAdjustmentEnabled={setMpgAdjustmentEnabled}
            />

            <NotesSection option={option} setOption={setOption} />
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              clearEdit()
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              console.log("Submit button clicked")
              // First distribute costs
              distributeCosts()
              // Add a small delay to ensure costs are distributed before submitting
              setTimeout(() => {
                console.log("Submitting option:", option)
                onSubmit(option, !!editOption, editOption?.id)
              }, 100)
            }}
          >
            {editOption ? "Update Option" : "Create Option"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
