import { LoadingSpinner } from "@/components/loading-spinner"

export default function ToolsLoading() {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center h-[calc(100vh-100px)]">
      <LoadingSpinner size="lg" text="Loading tools..." />
    </div>
  )
}
