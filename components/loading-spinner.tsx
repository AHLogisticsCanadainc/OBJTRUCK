import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  text?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
  className?: string
  textClassName?: string
}

export function LoadingSpinner({
  text,
  size = "md",
  fullScreen = false,
  className,
  textClassName,
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size]

  const content = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn(`${sizeClass} animate-spin text-primary`)} />
      {text && <span className={cn("mt-2 text-sm text-muted-foreground", textClassName)}>{text}</span>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}
