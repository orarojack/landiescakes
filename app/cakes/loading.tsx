import { LoadingSpinner } from "@/components/modern/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading cakes...</p>
      </div>
    </div>
  )
} 