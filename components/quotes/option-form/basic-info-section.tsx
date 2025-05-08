"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { determineLoadType, ensureNumber, safelyFormatNumber } from "./utils"

interface BasicInfoSectionProps {
  option: any
  setOption: (option: any) => void
  adjustedMpg: number | undefined
  mpgAdjustmentEnabled: boolean
  setMpgAdjustmentEnabled: (enabled: boolean) => void
  estimatedTotalCost: number | undefined
  handleNumberChange: (field: string, value: string) => void
}

export function BasicInfoSection({
  option,
  setOption,
  adjustedMpg,
  mpgAdjustmentEnabled,
  setMpgAdjustmentEnabled,
  estimatedTotalCost,
  handleNumberChange,
}: BasicInfoSectionProps) {
  // Ensure we have numbers for display
  const truckMpg = ensureNumber(option.truckmpg)
  const adjustedMpgValue = ensureNumber(adjustedMpg)

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Required Information</h3>
      <Separator className={cn("mb-4", "bg-blue-200 dark:bg-blue-900/50")} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Option Name *</Label>
          <Input
            id="name"
            placeholder="e.g. Standard Delivery"
            value={option.name}
            onChange={(e) => setOption({ ...option, name: e.target.value })}
            required
            className="dark:bg-background/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carrier">Carrier *</Label>
          <Input
            id="carrier"
            placeholder="e.g. ABC Logistics"
            value={option.carrier || ""}
            onChange={(e) => setOption({ ...option, carrier: e.target.value })}
            required
            className="dark:bg-background/80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="pickup_date">Pickup Date *</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="pickup_date"
                  type="date"
                  value={option.pickup_date || ""}
                  onChange={(e) => setOption({ ...option, pickup_date: e.target.value })}
                  required
                  className="dark:bg-background/80"
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Transit time will be calculated automatically</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          <Label htmlFor="delivery_date">Delivery Date *</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="delivery_date"
                  type="date"
                  value={option.delivery_date || ""}
                  onChange={(e) => setOption({ ...option, delivery_date: e.target.value })}
                  required
                  className="dark:bg-background/80"
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Transit time will be calculated automatically</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="transit_time">Transit Time *</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="transit_time"
                  placeholder="e.g. 3-5 days"
                  value={option.transit_time || ""}
                  onChange={(e) => setOption({ ...option, transit_time: e.target.value })}
                  className={cn(
                    "dark:bg-background/80",
                    option.pickup_date && option.delivery_date
                      ? "bg-blue-50/50 dark:bg-blue-900/20 cursor-help border-dashed"
                      : "",
                  )}
                  readOnly={!!(option.pickup_date && option.delivery_date)}
                  required
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                {option.pickup_date && option.delivery_date ? (
                  <p>Automatically calculated based on pickup and delivery dates</p>
                ) : (
                  <p>Set pickup and delivery dates to auto-calculate transit time</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          <Label htmlFor="equipment_type">Equipment Type *</Label>
          <Input
            id="equipment_type"
            placeholder="e.g. Dry Van, Flatbed"
            value={option.equipment_type || ""}
            onChange={(e) => setOption({ ...option, equipment_type: e.target.value })}
            required
            className="dark:bg-background/80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs) *</Label>
          <Input
            id="weight"
            type="number"
            placeholder="e.g. 2500"
            value={option.weight?.toString() || ""}
            onChange={(e) => handleNumberChange("weight", e.target.value)}
            required
            className="dark:bg-background/80"
          />
          {option.weight && (
            <div className="mt-2 text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {determineLoadType(option.weight).type} Load
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">{determineLoadType(option.weight).weightRange}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="distance" className="flex items-center">
            Total Miles *
          </Label>
          <Input
            id="distance"
            type="number"
            placeholder="e.g. 500"
            value={option.distance?.toString() || ""}
            onChange={(e) => handleNumberChange("distance", e.target.value)}
            required
            className="dark:bg-background/80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="truckmpg" className="flex items-center">
            Truck MPG *
          </Label>
          <div className="relative">
            <Input
              id="truckmpg"
              type="number"
              step="0.1"
              placeholder="e.g. 6.5"
              value={option.truckmpg?.toString() || ""}
              onChange={(e) => handleNumberChange("truckmpg", e.target.value)}
              required
              className="dark:bg-background/80"
            />
            {adjustedMpgValue !== undefined && adjustedMpgValue !== truckMpg && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge
                        variant="outline"
                        className="cursor-help bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Adjusted: {safelyFormatNumber(adjustedMpgValue, 1)} mpg
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                    <p className="font-medium mb-1">MPG Adjustment:</p>
                    <p>Base MPG: {safelyFormatNumber(truckMpg, 1)} mpg</p>
                    <p>Adjusted MPG: {safelyFormatNumber(adjustedMpgValue, 1)} mpg</p>
                    <p className="mt-2 text-xs text-muted-foreground">MPG</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {option.weight && adjustedMpgValue !== undefined && adjustedMpgValue !== truckMpg && (
            <p className="text-xs text-green-600 dark:text-green-400">
              MPG adjusted for {determineLoadType(option.weight).type} load type
            </p>
          )}
          {/* Add the toggle for MPG adjustment */}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="mpgAdjustmentEnabled"
              checked={mpgAdjustmentEnabled}
              onCheckedChange={(checked) => {
                setMpgAdjustmentEnabled(checked === true)
              }}
            />
            <Label htmlFor="mpgAdjustmentEnabled" className="text-xs cursor-pointer">
              Enable automatic MPG adjustment based on load type
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="driverratepermile" className="flex items-center">
            Driver Rate Per Mile ($) *
          </Label>
          <Input
            id="driverratepermile"
            type="number"
            step="0.01"
            placeholder="e.g. 0.55"
            value={option.driverratepermile?.toString() || ""}
            onChange={(e) => handleNumberChange("driverratepermile", e.target.value)}
            required
            className="dark:bg-background/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costperliter" className="flex items-center">
            Cost Per Liter ($) *
          </Label>
          <Input
            id="costperliter"
            type="number"
            step="0.01"
            placeholder="e.g. 1.25"
            value={option.costperliter?.toString() || ""}
            onChange={(e) => handleNumberChange("costperliter", e.target.value)}
            required
            className="dark:bg-background/80"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="space-y-2">
          <Label htmlFor="total_rate" className="flex items-center">
            Total Rate ($) *
          </Label>
          <div className="relative">
            <Input
              id="total_rate"
              type="number"
              step="0.01"
              placeholder="e.g. 1500.00"
              value={option.total_rate?.toString() || ""}
              onChange={(e) => handleNumberChange("total_rate", e.target.value)}
              required
              className="dark:bg-background/80"
            />
            {estimatedTotalCost !== undefined && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge
                        variant="outline"
                        className="cursor-help bg-blue-50/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        Base: ${safelyFormatNumber(estimatedTotalCost, 2)}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                    <p className="font-medium mb-1">Base Cost Breakdown:</p>
                    <p>Fuel Cost: ${safelyFormatNumber(option.fuel_cost, 2)}</p>
                    <p>Driver Pay: ${safelyFormatNumber(option.driver_pay, 2)}</p>
                    <p className="mt-2 font-medium">Base Total: ${safelyFormatNumber(estimatedTotalCost, 2)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      This is the base cost. Your total rate should cover this plus additional costs.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your desired rate. The system will automatically distribute the remaining amount.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id="is_recommended"
          checked={option.is_recommended || false}
          onCheckedChange={(checked) => setOption({ ...option, is_recommended: checked === true })}
        />
        <Label htmlFor="is_recommended">Recommended Option</Label>
      </div>
    </div>
  )
}
