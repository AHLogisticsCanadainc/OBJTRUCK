import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Skeleton className="h-9 w-24 mr-4" />
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-1" />
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />

        <Skeleton className="h-[300px] w-full rounded-md" />

        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    </div>
  )
}
