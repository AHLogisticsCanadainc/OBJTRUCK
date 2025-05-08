"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface UsernameInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
  domain?: string
  helperText?: string
  label?: string
  className?: string
  autoComplete?: string
}

export const UsernameInput = forwardRef<HTMLInputElement, UsernameInputProps>(
  (
    {
      id,
      value,
      onChange,
      disabled,
      required,
      placeholder,
      domain,
      helperText,
      label = "Username",
      className = "",
      autoComplete,
    },
    ref,
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <Label htmlFor={id} className="text-sm font-medium text-neutral-700">
            {label}
          </Label>
          {helperText && <span className="text-xs text-neutral-500">{helperText}</span>}
        </div>

        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={cn(`pr-[${domain?.length * 0.5 + 1}rem]`, className)}
            autoComplete={autoComplete || "username"}
          />
          {domain && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-sm text-neutral-400">{domain}</span>
            </div>
          )}
        </div>
      </div>
    )
  },
)

UsernameInput.displayName = "UsernameInput"
