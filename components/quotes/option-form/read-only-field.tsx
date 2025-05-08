import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { safelyFormatNumber } from "./utils"

interface ReadOnlyFieldProps {
  label: string
  value: any
  unit?: string
  explanation: string
}

export function ReadOnlyField({ label, value, unit = "", explanation }: ReadOnlyFieldProps) {
  // Format the value safely
  let displayValue = "N/A"

  if (value !== undefined && value !== null) {
    if (typeof value === "number") {
      displayValue = safelyFormatNumber(value)
    } else {
      displayValue = String(value)
    }
  }

  const displayText = unit ? `${displayValue} ${unit}` : displayValue

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label className="flex-1">{label}</Label>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <Lock className="h-3 w-3 mr-1" />
          Auto-calculated
        </Badge>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-help">
              <Input
                value={displayText}
                readOnly
                className="bg-blue-50/50 dark:bg-blue-900/20 cursor-help border-dashed"
              />
              <div className="absolute inset-0 pointer-events-none border border-blue-300 dark:border-blue-700 rounded-md opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm p-4 text-sm" side="top">
            <p className="font-medium mb-1">How this is calculated:</p>
            <p>{explanation}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
