import { LoadingSpinner } from "@/components/loading-spinner"
import { Breadcrumb } from "@/components/breadcrumb"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Analytics & Reports" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-gray-500">View detailed analytics and generate reports</p>
      </div>

      <div className="flex justify-center items-center py-24">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    </div>
  )
}
