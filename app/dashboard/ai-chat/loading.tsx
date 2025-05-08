import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
