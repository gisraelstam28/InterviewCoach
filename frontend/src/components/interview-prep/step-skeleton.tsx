export default function StepSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-6">
        <div className="h-8 bg-gray-200 rounded w-40"></div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>

          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}
