"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { ProvinceOption } from "./types"

interface ProvinceSelectorProps {
  value: string
  onChange: (value: string) => void
  provinces: ProvinceOption[]
}

export function ProvinceSelector({ value, onChange, provinces }: ProvinceSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="province">Province/Territory</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="province">
          <SelectValue placeholder="Select province" />
        </SelectTrigger>
        <SelectContent>
          {provinces.map((province) => (
            <SelectItem key={province.code} value={province.code}>
              {province.name} ({province.rate}%)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
