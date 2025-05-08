"use client"

import * as React from "react"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  selected?: Date | null
  onSelect?: (date: Date | undefined) => void
  placeholderText?: string
  className?: string
  disabled?: boolean
  [key: string]: any
}

export function DatePicker({
  selected,
  onSelect,
  placeholderText = "Pick a date",
  className,
  disabled = false,
  ...props
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected || undefined)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (selected !== undefined || selected !== null) {
      setDate(selected || undefined)
    }
  }, [selected])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (onSelect) {
      onSelect(selectedDate)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          disabled={disabled}
        >
          {date ? format(date, "PPP") : <span>{placeholderText}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}
