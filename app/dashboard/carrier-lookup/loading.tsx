import { LoadingSpinner } from "@/components/loading-spinner"

export default function CarrierLookupLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner size="lg" text="Loading carrier lookup..." />
    </div>
  )
}
