import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Normalize status to lowercase for consistent handling
  const normalizedStatus = status.toLowerCase()

  const statusStyles = {
    pending: cn(
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    ),
    approved: cn(
      "bg-green-100 text-green-800 border-green-200",
      "dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    ),
    rejected: cn("bg-red-100 text-red-800 border-red-200", "dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"),
    expired: cn(
      "bg-gray-100 text-gray-800 border-gray-200",
      "dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
    ),
  }

  const statusIcons = {
    pending: <Clock className="mr-1 h-3 w-3" />,
    approved: <CheckCircle className="mr-1 h-3 w-3" />,
    rejected: <XCircle className="mr-1 h-3 w-3" />,
    expired: <Calendar className="mr-1 h-3 w-3" />,
  }

  const statusLabels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired",
  }

  // Default to the normalized status or use the original if not found
  const statusKey = normalizedStatus as keyof typeof statusStyles
  const style = statusStyles[statusKey] || "bg-gray-100 text-gray-800 border-gray-200"
  const icon = statusIcons[statusKey] || null
  const label = statusLabels[statusKey] || status

  return (
    <Badge variant="outline" className={`flex items-center ${style}`}>
      {icon}
      {label}
    </Badge>
  )
}
