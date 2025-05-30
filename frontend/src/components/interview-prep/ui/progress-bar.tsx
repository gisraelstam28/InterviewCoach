export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}
