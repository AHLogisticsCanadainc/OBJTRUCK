"\"use client"

import * as React from "react"
import { DatabaseIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Database = React.forwardRef<
  React.ElementRef<typeof DatabaseIcon>,
  React.ComponentPropsWithoutRef<typeof DatabaseIcon>
>(({ className, ...props }, ref) => <DatabaseIcon ref={ref} className={cn("h-4 w-4", className)} {...props} />)
Database.displayName = DatabaseIcon.displayName

export { Database }
