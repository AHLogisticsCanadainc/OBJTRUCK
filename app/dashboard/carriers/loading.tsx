import { LoadingSpinner } from "@/components/loading-spinner"

export default function CarriersLoading() {
  return (
    <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
