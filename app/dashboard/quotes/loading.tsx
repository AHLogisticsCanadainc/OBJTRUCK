import { LoadingSpinner } from "@/components/loading-spinner"

export default function QuotesLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <LoadingSpinner size="lg" text="Loading quotes manager..." />
    </div>
  )
}
