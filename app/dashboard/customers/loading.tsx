import { LoadingSpinner } from "@/components/loading-spinner"

export default function CustomersLoading() {
  return (
    <div className="p-6 pt-20">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Customers Management</h1>
      <LoadingSpinner text="Loading customers..." />
    </div>
  )
}
