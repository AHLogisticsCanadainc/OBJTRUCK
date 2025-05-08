"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReadOnlyField } from "./read-only-field"
import { safelyFormatNumber } from "./utils"

interface PricingSectionProps {
  option: any
  setOption: (option: any) => void
  calculationPerformed: boolean
  estimatedTotalCost: number | undefined
  manualCostEdit: boolean
  setManualCostEdit: (enabled: boolean) => void
  distributingCosts: boolean
  handleNumberChange: (field: string, value: string) => void
}

export function PricingSection({
  option,
  setOption,
  calculationPerformed,
  estimatedTotalCost,
  manualCostEdit,
  setManualCostEdit,
  distributingCosts,
  handleNumberChange,
}: PricingSectionProps) {
  // Calculate the percentage of the total for a given cost
  const calculatePercentage = (value?: number) => {
    if (!value || !option.total_rate) return "0%"
    return `${Math.round((value / option.total_rate) * 100)}%`
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Cost Distribution</h3>
      <Separator className={cn("mb-4", "bg-purple-200 dark:bg-purple-900/50")} />

      {calculationPerformed ? (
        <div className="space-y-2 border p-3 rounded-md bg-blue-50/30 dark:bg-blue-900/20 mb-4">
          <h4 className="text-sm font-medium">Cost Distribution</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Base Costs:</p>
              <p className="text-sm font-medium">${safelyFormatNumber(estimatedTotalCost, 2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining:</p>
              <p className="text-sm font-medium">
                $
                {option.total_rate && estimatedTotalCost
                  ? safelyFormatNumber(Math.max(0, option.total_rate - estimatedTotalCost), 2)
                  : "0.00"}
              </p>
            </div>
          </div>
          <div className="pt-1 mt-1 border-t border-border">
            <p className="text-xs text-muted-foreground">Total Rate:</p>
            <p className="text-sm font-medium">${safelyFormatNumber(option.total_rate, 2)}</p>
          </div>
        </div>
      ) : (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Fill in required fields to see cost distribution.</AlertDescription>
        </Alert>
      )}

      <h3 className="text-lg font-medium mb-2">
        Base Costs {manualCostEdit ? "(Manual Editing)" : "(Auto-Calculated)"}
      </h3>
      <Separator className={cn("mb-4", "bg-purple-200 dark:bg-purple-900/50")} />
      {calculationPerformed ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fuel Cost */}
          {manualCostEdit ? (
            <div className="space-y-2">
              <Label htmlFor="fuel_cost">Fuel Cost ($)</Label>
              <Input
                id="fuel_cost"
                type="number"
                step="0.01"
                value={option.fuel_cost?.toString() || ""}
                onChange={(e) => handleNumberChange("fuel_cost", e.target.value)}
                className="dark:bg-background/80 border-blue-300 dark:border-blue-700"
              />
            </div>
          ) : (
            <ReadOnlyField
              label="Fuel Cost ($)"
              value={option.fuel_cost}
              explanation={`Fuel Cost = Estimated Fuel Needed × Cost Per Liter × 3.78541 liters/gallon = ${safelyFormatNumber(option.estfuel_needed, 2)} gallons × ${safelyFormatNumber(option.costperliter, 2)}/liter × 3.78541 = ${safelyFormatNumber(option.fuel_cost, 2)}`}
            />
          )}

          {/* Driver Pay */}
          {manualCostEdit ? (
            <div className="space-y-2">
              <Label htmlFor="driver_pay">Driver Pay ($)</Label>
              <Input
                id="driver_pay"
                type="number"
                step="0.01"
                value={option.driver_pay?.toString() || ""}
                onChange={(e) => handleNumberChange("driver_pay", e.target.value)}
                className="dark:bg-background/80 border-blue-300 dark:border-blue-700"
              />
            </div>
          ) : (
            <ReadOnlyField
              label="Driver Pay ($)"
              value={option.driver_pay}
              explanation={`Driver Pay = Total Miles × Driver Rate Per Mile = ${option.distance} miles × $${safelyFormatNumber(option.driverratepermile, 2)}/mile = $${safelyFormatNumber(option.driver_pay, 2)}`}
            />
          )}

          {/* Equipment Maintenance */}
          {manualCostEdit ? (
            <div className="space-y-2">
              <Label htmlFor="equipment_maintenance">Equipment Maintenance ($)</Label>
              <Input
                id="equipment_maintenance"
                type="number"
                step="0.01"
                value={option.equipment_maintenance?.toString() || ""}
                onChange={(e) => handleNumberChange("equipment_maintenance", e.target.value)}
                className="dark:bg-background/80 border-blue-300 dark:border-blue-700"
              />
            </div>
          ) : (
            <ReadOnlyField
              label="Equipment Maintenance ($)"
              value={option.equipment_maintenance}
              explanation={`Equipment Maintenance = 35% of Remaining Amount = ${calculatePercentage(
                option.equipment_maintenance,
              )}`}
            />
          )}

          {/* Insurance Cost */}
          {manualCostEdit ? (
            <div className="space-y-2">
              <Label htmlFor="insurance_cost">Insurance Cost ($)</Label>
              <Input
                id="insurance_cost"
                type="number"
                step="0.01"
                value={option.insurance_cost?.toString() || ""}
                onChange={(e) => handleNumberChange("insurance_cost", e.target.value)}
                className="dark:bg-background/80 border-blue-300 dark:border-blue-700"
              />
            </div>
          ) : (
            <ReadOnlyField
              label="Insurance Cost ($)"
              value={option.insurance_cost}
              explanation={`Insurance Cost = 20% of Remaining Amount = ${calculatePercentage(option.insurance_cost)}`}
            />
          )}

          {/* Overhead Cost */}
          {manualCostEdit ? (
            <div className="space-y-2">
              <Label htmlFor="overhead_cost">Overhead Cost ($)</Label>
              <Input
                id="overhead_cost"
                type="number"
                step="0.01"
                value={option.overhead_cost?.toString() || ""}
                onChange={(e) => handleNumberChange("overhead_cost", e.target.value)}
                className="dark:bg-background/80 border-blue-300 dark:border-blue-700"
              />
            </div>
          ) : (
            <ReadOnlyField
              label="Overhead Cost ($)"
              value={option.overhead_cost}
              explanation={`Overhead Cost = 40% of Remaining Amount = ${calculatePercentage(option.overhead_cost)}`}
            />
          )}

          {/* Overheads Service Cost */}
          {manualCostEdit ? (
            <div className="space-y-2">
              <Label htmlFor="overheads_servicecost">Service Cost ($)</Label>
              <Input
                id="overheads_servicecost"
                type="number"
                step="0.01"
                value={option.overheads_servicecost?.toString() || ""}
                onChange={(e) => handleNumberChange("overheads_servicecost", e.target.value)}
                className="dark:bg-background/80 border-blue-300 dark:border-blue-700"
              />
            </div>
          ) : (
            <ReadOnlyField
              label="Service Cost ($)"
              value={option.overheads_servicecost}
              explanation={`Service Cost = 5% of Remaining Amount = ${calculatePercentage(
                option.overheads_servicecost,
              )}`}
            />
          )}
        </div>
      ) : (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Fill in required fields to see cost distribution.</AlertDescription>
        </Alert>
      )}

      {/* Add the combined costs display after the existing individual costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="overhead_and_servicecost">Combined Overhead & Service ($)</Label>
          <Input
            id="overhead_and_servicecost"
            type="text"
            value={
              option.overhead_cost !== undefined && option.overheads_servicecost !== undefined
                ? safelyFormatNumber(option.overhead_cost + option.overheads_servicecost, 2)
                : ""
            }
            className="dark:bg-background/80 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 cursor-not-allowed"
            readOnly={true}
          />
          <p className="text-xs text-muted-foreground">
            Sum of overhead cost (${safelyFormatNumber(option.overhead_cost, 2)}) and service cost ($
            {safelyFormatNumber(option.overheads_servicecost, 2)})
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maintance_and_insurance">Combined Maintenance & Insurance ($)</Label>
          <Input
            id="maintance_and_insurance"
            type="text"
            value={
              option.equipment_maintenance !== undefined && option.insurance_cost !== undefined
                ? safelyFormatNumber(option.equipment_maintenance + option.insurance_cost, 2)
                : ""
            }
            className="dark:bg-background/80 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 cursor-not-allowed"
            readOnly={true}
          />
          <p className="text-xs text-muted-foreground">
            Sum of maintenance cost (${safelyFormatNumber(option.equipment_maintenance, 2)}) and insurance cost ($
            {safelyFormatNumber(option.insurance_cost, 2)})
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id="manualCostEdit"
          checked={manualCostEdit}
          onCheckedChange={(checked) => setManualCostEdit(checked === true)}
        />
        <Label htmlFor="manualCostEdit">Enable Manual Cost Editing</Label>
      </div>

      {manualCostEdit && (
        <Alert className="mt-2 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200">
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            Manual cost editing is enabled. Your changes will be preserved when saving the option.
          </AlertDescription>
        </Alert>
      )}

      {!manualCostEdit && calculationPerformed && (
        <Alert className="mt-2 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200">
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            These costs are automatically distributed based on the difference between your total rate ($
            {safelyFormatNumber(option.total_rate, 2)}) and the base costs (${safelyFormatNumber(estimatedTotalCost, 2)}
            ). Enable "Manual Edit" above to customize these values.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
