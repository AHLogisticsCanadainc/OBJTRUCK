"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface RememberMeCheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function RememberMeCheckbox({
  id = "remember-me",
  checked,
  onChange,
  disabled = false,
}: RememberMeCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-[#ed1c23] data-[state=checked]:border-[#ed1c23]"
      />
      <div className="flex items-center">
        <Label htmlFor={id} className="text-sm text-neutral-600 cursor-pointer select-none">
          Remember me
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3.5 w-3.5 ml-1 text-neutral-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Keeps you signed in for 30 days. Only use on trusted devices.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
