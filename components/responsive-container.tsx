import type React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  as?: React.ElementType
  fluid?: boolean
}

export function ResponsiveContainer({
  children,
  className,
  as: Component = "div",
  fluid = false,
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn("w-full px-4 md:px-6 lg:px-8 mx-auto", fluid ? "max-w-full" : "max-w-7xl", className)}
      {...props}
    >
      {children}
    </Component>
  )
}
