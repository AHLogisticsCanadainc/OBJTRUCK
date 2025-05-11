"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { QuoteOption, QuoteStatus } from "@/types/quotes"
import {
  Clock,
  Truck,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Copy,
  Calendar,
  MapPin,
  Leaf,
  Info,
  Star,
  AlertTriangle,
  ClipboardList,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// First, import the Tooltip components
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Add the same load type definitions at the top of the file
interface LoadType {
  type: "Tandem" | "Tri" | "Quad"
  weightRange: string
  emissionRate: {
    kg: number
    lbs: number
  }
}

const LOAD_TYPES: LoadType[] = [
  {
    type: "Tandem",
    weightRange: "0-50,000 lbs",
    emissionRate: {
      kg: 1.275,
      lbs: 2.8,
    },
  },
  {
    type: "Tri",
    weightRange: "50,000-70,000 lbs",
    emissionRate: {
      kg: 1.457,
      lbs: 3.2,
    },
  },
  {
    type: "Quad",
    weightRange: "0-85,000 lbs",
    emissionRate: {
      kg: 1.7,
      lbs: 3.75,
    },
  },
]

interface QuoteOptionListProps {
  options: QuoteOption[]
  onUpdateStatus: (optionId: string, status: QuoteStatus) => void
  onEdit?: (option: QuoteOption) => void
  onDelete: (optionId: string) => void
  onDuplicate: (option: QuoteOption) => void
}

export function QuoteOptionList({ options, onUpdateStatus, onEdit, onDelete, onDuplicate }: QuoteOptionListProps) {
  if (options.length === 0) {
    return (
      <Card className="mt-4 border-dashed border-2">
        <CardContent className="p-8 text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No options have been added to this quote yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add an option to provide different pricing and service options.
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "N/A"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  // Update the formatNumber function to properly check if the value is a number before calling toFixed
  const formatNumber = (value?: number | string, decimals = 2, unit = "") => {
    if (value === undefined || value === null) return "N/A"

    const num = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(num)) return "N/A"

    return `${num.toFixed(decimals)}${unit ? ` ${unit}` : ""}`
  }

  // Add the function to determine load type
  function determineLoadType(weight?: number): LoadType {
    if (!weight) return LOAD_TYPES[0] // Default to Tandem if no weight

    if (weight > 0 && weight <= 50000) {
      return LOAD_TYPES[0] // Tandem
    } else if (weight > 50000 && weight <= 70000) {
      return LOAD_TYPES[1] // Tri
    } else if (weight <= 85000) {
      return LOAD_TYPES[2] // Quad
    } else {
      return LOAD_TYPES[2] // Default to Quad for very heavy loads
    }
  }

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <Card
          key={option.id}
          className={cn(
            "overflow-hidden",
            option.is_recommended && "border-yellow-300 dark:border-yellow-600 shadow-md",
          )}
        >
          <CardHeader className={cn("py-3 border-b", "bg-muted/30 dark:bg-muted/10")}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base flex items-center">
                  {option.is_recommended && <Star className="h-4 w-4 mr-1 text-yellow-500 dark:text-yellow-400" />}
                  {option.name || `Option ${index + 1}`}
                </CardTitle>
                {option.is_recommended && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-yellow-100 text-yellow-800 border-yellow-200",
                      "dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
                    )}
                  >
                    Recommended
                  </Badge>
                )}
              </div>
              <StatusBadge status={option.status} />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Option Summary */}
            <div className={cn("p-3 border-b grid grid-cols-3 gap-2", "bg-muted/10 dark:bg-muted/5")}>
              <div className="space-y-1 flex flex-col justify-center items-center text-center p-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Equipment</p>
                <p className="text-sm font-medium flex items-center">
                  <Truck className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  {option.equipment_type || "Not specified"}
                </p>
              </div>
              <div className="space-y-1 flex flex-col justify-center items-center text-center p-2 border-x">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Transit Time</p>
                <p className="text-sm font-medium flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  {option.transit_time || "Not specified"}
                </p>
              </div>
              <div className="space-y-1 flex flex-col justify-center items-center text-center p-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Rate</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm font-medium flex items-center cursor-help">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        {formatCurrency(option.total_rate)}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="p-3 text-sm" side="bottom">
                      <p>Broker-set rate for customer</p>
                      {option.fuel_cost !== undefined && option.driver_pay !== undefined && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Calculated costs: ${(option.fuel_cost + option.driver_pay).toFixed(2)}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full p-4">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Service Details</TabsTrigger>
                <TabsTrigger value="pricing">Pricing Breakdown</TabsTrigger>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0 overflow-x-auto">
                <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-primary" />
                        Schedule
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Pickup</p>
                          <p className="text-sm">{option.pickup_date || "Not specified"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Delivery</p>
                          <p className="text-sm">{option.delivery_date || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Truck className="h-4 w-4 mr-1.5 text-primary" />
                        Carrier & Equipment
                      </h4>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Carrier</p>
                          <p className="text-sm">{option.carrier || "Not specified"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Equipment Type</p>
                          <p className="text-sm">{option.equipment_type || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                        Distance & Weight
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="text-sm">
                            {option.distance ? `${formatNumber(option.distance)} miles` : "Not specified"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="text-sm">
                            {option.weight ? `${formatNumber(option.weight)} lbs` : "Not specified"}
                          </p>
                          {option.weight && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Load Type</p>
                              <p className="text-sm flex items-center">
                                <Truck className="h-3.5 w-3.5 mr-1 text-primary" />
                                {determineLoadType(option.weight).type} ({determineLoadType(option.weight).weightRange})
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {option.description && (
                      <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-1.5 text-primary" />
                          Description
                        </h4>
                        <p className="text-sm">{option.description}</p>
                      </div>
                    )}

                    {option.features && (
                      <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1.5 text-primary" />
                          Features
                        </h4>
                        <p className="text-sm">{option.features}</p>
                      </div>
                    )}
                  </div>
                </div>

                {option.notes && (
                  <div className={cn("mt-4 rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-1.5 text-primary" />
                      Notes
                    </h4>
                    <p className="text-sm">{option.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="mt-0 overflow-x-auto">
                <div className={cn("rounded-lg p-4 mb-4", "bg-muted/20 dark:bg-primary/10")}>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1.5 text-primary" />
                    Total Rate (Broker-Set)
                  </h4>
                  <div className="text-2xl font-bold text-center mb-2">{formatCurrency(option.total_rate)}</div>
                  {option.fuel_cost !== undefined && option.driver_pay !== undefined && (
                    <div className="text-center text-sm text-muted-foreground">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help underline decoration-dotted">
                              Calculated costs: ${(option.fuel_cost + option.driver_pay).toFixed(2)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="p-3" side="bottom">
                            <p>Sum of fuel cost and driver pay</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  {/* Cost breakdown card */}
                  <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                    <h4 className="text-sm font-medium mb-3">Cost Breakdown</h4>

                    {option.fuel_cost !== undefined && (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs">Fuel Cost</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs font-medium cursor-help">
                                  {formatCurrency(option.fuel_cost)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                                <p className="font-medium mb-1">How this is calculated:</p>
                                <p>Fuel Cost = Estimated Fuel Needed × Cost Per Liter × 3.78541 liters/gallon</p>
                                {option.Est_fuel_needed && option.costperliter && (
                                  <p className="mt-1">
                                    = {formatNumber(option.Est_fuel_needed)} gallons × $
                                    {formatNumber(option.costperliter)}/liter × 3.78541 = $
                                    {formatNumber(option.fuel_cost)}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Progress
                          value={calculatePercentage(option.fuel_cost, option.total_rate)}
                          className={cn("h-1.5", "dark:bg-gray-800")}
                        />
                      </div>
                    )}

                    {option.driver_pay !== undefined && (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs">Driver Pay</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs font-medium cursor-help">
                                  {formatCurrency(option.driver_pay)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                                <p className="font-medium mb-1">How this is calculated:</p>
                                <p>Driver Pay = Total Miles × Driver Rate Per Mile</p>
                                {option.distance && option.driverratepermile && (
                                  <p className="mt-1">
                                    = {formatNumber(option.distance)} miles × ${formatNumber(option.driverratepermile)}
                                    /mile = ${formatNumber(option.driver_pay)}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Progress
                          value={calculatePercentage(option.driver_pay, option.total_rate)}
                          className={cn("h-1.5", "dark:bg-gray-800")}
                        />
                      </div>
                    )}

                    {option.equipment_maintenance !== undefined && (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs">Equipment Maintenance</span>
                          <span className="text-xs font-medium">{formatCurrency(option.equipment_maintenance)}</span>
                        </div>
                        <Progress
                          value={calculatePercentage(option.equipment_maintenance, option.total_rate)}
                          className={cn("h-1.5", "dark:bg-gray-800")}
                        />
                      </div>
                    )}

                    {option.insurance_cost !== undefined && (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs">Insurance</span>
                          <span className="text-xs font-medium">{formatCurrency(option.insurance_cost)}</span>
                        </div>
                        <Progress
                          value={calculatePercentage(option.insurance_cost, option.total_rate)}
                          className={cn("h-1.5", "dark:bg-gray-800")}
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional costs card */}
                  <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                    <h4 className="text-sm font-medium mb-3">Additional Costs</h4>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Overhead Cost</span>
                        <span className="text-sm">{formatCurrency(option.overhead_cost)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Service Cost</span>
                        <span className="text-sm">{formatCurrency(option.overheads_servicecost)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Driver Rate Per Mile</span>
                        <span className="text-sm">
                          {option.driverratepermile ? `$${formatNumber(option.driverratepermile)}/mile` : "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Cost Per Liter</span>
                        <span className="text-sm">
                          {option.costperliter ? `$${formatNumber(option.costperliter)}/liter` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add new section for combined costs */}
                <div className={cn("rounded-lg p-3 mt-4", "bg-muted/20 dark:bg-muted/10")}>
                  <h4 className="text-sm font-medium mb-3">Combined Costs</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Overhead & Service Total</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            option.overhead_and_servicecost !== undefined
                              ? option.overhead_and_servicecost
                              : option.overhead_cost && option.overheads_servicecost
                                ? option.overhead_cost + option.overheads_servicecost
                                : undefined,
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Components:</span>
                        <span>
                          Overhead: {formatCurrency(option.overhead_cost)} + Service:{" "}
                          {formatCurrency(option.overheads_servicecost)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Maintenance & Insurance Total</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            option.maintance_and_insurance !== undefined
                              ? option.maintance_and_insurance
                              : option.equipment_maintenance && option.insurance_cost
                                ? option.equipment_maintenance + option.insurance_cost
                                : undefined,
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Components:</span>
                        <span>
                          Maintenance: {formatCurrency(option.equipment_maintenance)} + Insurance:{" "}
                          {formatCurrency(option.insurance_cost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="environmental" className="mt-0 overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1.5 text-yellow-500 dark:text-yellow-400" />
                      Emissions
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">CO2 Emissions</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-medium cursor-help">
                                  {option.co2_emissions ? `${formatNumber(option.co2_emissions)} tons` : "N/A"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                                <p className="font-medium mb-1">How this is calculated:</p>
                                <p>CO2 Emissions = Distance × Load-Specific Emission Rate</p>
                                {option.weight && option.distance && (
                                  <>
                                    <p className="mt-1">
                                      Load Type: {determineLoadType(option.weight).type} (
                                      {determineLoadType(option.weight).weightRange})
                                    </p>
                                    <p>Emission Rate: {determineLoadType(option.weight).emissionRate.kg} kg/mile</p>
                                    <p>
                                      = {formatNumber(option.distance)} miles ×{" "}
                                      {determineLoadType(option.weight).emissionRate.kg} kg/mile ={" "}
                                      {formatNumber(option.distance * determineLoadType(option.weight).emissionRate.kg)}{" "}
                                      kg
                                    </p>
                                    <p>
                                      ={" "}
                                      {formatNumber(
                                        (option.distance * determineLoadType(option.weight).emissionRate.kg) / 1000,
                                      )}{" "}
                                      metric tons
                                    </p>
                                  </>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {option.co2_emissions && (
                          <Progress
                            value={Math.min(100, (option.co2_emissions / 5) * 100)}
                            className={cn("h-1.5 mt-1", "dark:bg-gray-800")}
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Trees Needed for Offset</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-medium cursor-help">
                                  {option.trees_needed ? formatNumber(option.trees_needed) : "N/A"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                                <p className="font-medium mb-1">How this is calculated:</p>
                                <p>Trees Needed = CO2 Emissions (in metric tons)</p>
                                <p className="mt-1">For every 1 metric ton of CO2 emitted, 1 tree is planted.</p>
                                {option.co2_emissions && (
                                  <p>
                                    = {formatNumber(option.co2_emissions)} tons = {formatNumber(option.trees_needed)}{" "}
                                    trees
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Each tree is estimated to absorb 1 ton of CO2 over its 45-year lifespan.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {option.trees_needed && (
                          <Progress
                            value={Math.min(100, (option.trees_needed / 20) * 100)}
                            className={cn("h-1.5 mt-1", "dark:bg-gray-800")}
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Carbon Offset Needed</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-medium cursor-help">
                                  {option.carbon_offsetneeded ? formatNumber(option.carbon_offsetneeded) : "N/A"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                                <p className="font-medium mb-1">How this is calculated:</p>
                                <p>Carbon Offset Needed = CO2 Emissions</p>
                                {option.co2_emissions && (
                                  <p className="mt-1">= {formatNumber(option.co2_emissions)} tons</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn("rounded-lg p-3", "bg-muted/20 dark:bg-muted/10")}>
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <Leaf className="h-4 w-4 mr-1.5 text-green-500 dark:text-green-400" />
                      Fuel Consumption
                    </h4>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Truck MPG</span>
                        <span className="text-sm">{option.truckmpg ? `${option.truckmpg} mpg` : "N/A"}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Estimated Fuel Needed</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm cursor-help">
                                {option.Est_fuel_needed ? `${formatNumber(option.Est_fuel_needed)} gallons` : "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm p-4 text-sm" side="top">
                              <p className="font-medium mb-1">How this is calculated:</p>
                              <p>Estimated Fuel Needed = Total Miles ÷ Truck MPG</p>
                              {option.distance && option.truckmpg && (
                                <p className="mt-1">
                                  = {formatNumber(option.distance)} miles ÷ {formatNumber(option.truckmpg)} mpg ={" "}
                                  {formatNumber(option.Est_fuel_needed)} gallons
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Estimated Fuel Cost</span>
                        <span className="text-sm">{formatCurrency(option.fuel_cost)}</span>
                      </div>
                    </div>

                    {option.distance && option.truckmpg && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">Fuel Efficiency</div>
                        <div className="flex items-center">
                          <Progress
                            value={Math.min(100, (option.truckmpg / 10) * 100)}
                            className={cn("flex-1 h-2", "dark:bg-gray-800")}
                          />
                          <span className="text-xs ml-2">
                            {option.truckmpg > 8 ? "Excellent" : option.truckmpg > 6 ? "Good" : "Average"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className={cn("p-3 border-t flex items-center justify-end gap-2", "bg-muted/10 dark:bg-muted/5")}>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(option)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering the card click
                console.log("Duplicating option:", option.id)
                onDuplicate(option)
              }}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => onDelete(option.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-3">
                  <MoreHorizontal className="h-4 w-4 mr-1" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Updating option ${option.id} status to Pending`)
                    onUpdateStatus(option.id, "pending")
                  }}
                  disabled={option.status.toLowerCase() === "pending"}
                >
                  <Clock className="h-4 w-4 mr-2 text-yellow-500 dark:text-yellow-400" />
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Updating option ${option.id} status to Approved`)
                    onUpdateStatus(option.id, "approved")
                  }}
                  disabled={option.status.toLowerCase() === "approved"}
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
                  Mark as Approved
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Updating option ${option.id} status to Rejected`)
                    onUpdateStatus(option.id, "rejected")
                  }}
                  disabled={option.status.toLowerCase() === "rejected"}
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                  Mark as Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// Helper function to calculate percentage for progress bars
function calculatePercentage(value?: number, total?: number): number {
  if (!value || !total || total === 0) return 0
  return Math.min(100, (value / total) * 100)
}
