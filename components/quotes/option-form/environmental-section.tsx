import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { determineLoadType, ensureNumber, safelyFormatNumber } from "./utils"
import type { LoadType } from "./types"

interface EnvironmentalSectionProps {
  option: any
  loadType: LoadType
  adjustedMpg: number | undefined
  mpgAdjustmentEnabled: boolean
  setMpgAdjustmentEnabled: (enabled: boolean) => void
}

export function EnvironmentalSection({
  option,
  loadType,
  adjustedMpg,
  mpgAdjustmentEnabled,
  setMpgAdjustmentEnabled,
}: EnvironmentalSectionProps) {
  // Ensure we have numbers for display
  const truckMpg = ensureNumber(option.truckmpg)
  const adjustedMpgValue = ensureNumber(adjustedMpg)

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Environmental Impact</h3>
      <Separator className={cn("mb-4", "bg-emerald-200 dark:bg-emerald-900/50")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CO2 Emissions */}
        <div className="space-y-2">
          <Label>CO2 Emissions (tons)</Label>
          <div className="relative">
            <div className="p-2 bg-blue-50/50 dark:bg-blue-900/20 border border-dashed rounded-md">
              {safelyFormatNumber(option.co2_emissions, 2)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Calculated based on distance and load type emission rate</p>
        </div>

        {/* Trees Needed */}
        <div className="space-y-2">
          <Label>Trees Needed</Label>
          <div className="relative">
            <div className="p-2 bg-blue-50/50 dark:bg-blue-900/20 border border-dashed rounded-md">
              {option.trees_needed || "N/A"}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Number of trees needed to offset CO2 emissions</p>
        </div>

        {/* Carbon Offset Needed */}
        <div className="space-y-2">
          <Label>Carbon Offset Needed (tons)</Label>
          <div className="relative">
            <div className="p-2 bg-blue-50/50 dark:bg-blue-900/20 border border-dashed rounded-md">
              {safelyFormatNumber(option.carbon_offsetneeded, 2)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Amount of carbon offset required</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Fuel Efficiency</h4>
        <div className="p-3 rounded-md bg-green-50/30 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Base MPG:</p>
              <p className="text-sm font-medium">{safelyFormatNumber(truckMpg, 1) || "N/A"} mpg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Adjusted MPG:</p>
              <p className="text-sm font-medium">
                {safelyFormatNumber(adjustedMpgValue, 1) || safelyFormatNumber(truckMpg, 1) || "N/A"} mpg
              </p>
            </div>

            {adjustedMpgValue !== undefined && adjustedMpgValue !== truckMpg && truckMpg !== undefined && (
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground">Reduction:</p>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  -{(100 - (adjustedMpgValue / truckMpg) * 100).toFixed(0)}% efficiency for{" "}
                  {determineLoadType(option.weight).type} load type
                </p>
              </div>
            )}
          </div>

          <div className="mt-3">
            <p className="text-xs text-muted-foreground">Explanation:</p>
            {mpgAdjustmentEnabled ? (
              <div className="text-sm">
                <p className="mb-2">
                  Heavier loads require more fuel to transport, reducing fuel efficiency. The MPG adjustment is based on
                  the weight of the load:
                </p>
                <ul className="list-disc pl-5 mt-1 text-xs">
                  <li>Under 25,000 lbs: No reduction</li>
                  <li>25,000-50,000 lbs: 15% reduction</li>
                  <li>50,000-70,000 lbs: 25% reduction</li>
                  <li>70,000-85,000 lbs: 35% reduction</li>
                  <li>85,000-100,000 lbs: 45% reduction</li>
                  <li>Above 100,000 lbs: 55% reduction</li>
                </ul>
              </div>
            ) : (
              <p className="text-sm">
                MPG adjustment is currently disabled. When enabled, heavier loads would receive efficiency reductions
                based on weight ranges, from 15% up to 55% for the heaviest loads.
              </p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mpgAdjustmentEnabledEnv"
                checked={mpgAdjustmentEnabled}
                onCheckedChange={(checked) => {
                  setMpgAdjustmentEnabled(checked === true)
                }}
              />
              <Label htmlFor="mpgAdjustmentEnabledEnv" className="text-sm cursor-pointer">
                Enable automatic MPG adjustment based on load type
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
