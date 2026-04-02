/**
 * App Loading Skeleton
 * 
 * Shows during initial app load and auth check
 * Prevents flash of unauthenticated content
 */

export function AppSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-pulse">
        {/* Logo placeholder */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
        </div>

        {/* Title placeholder */}
        <div className="space-y-2 text-center">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>

        {/* Form placeholder */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-11 bg-gray-200 rounded" />
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-11 bg-gray-200 rounded" />
          </div>

          <div className="h-11 bg-gray-200 rounded" />
        </div>

        {/* Loading text */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span>Memuat sistem...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppSkeleton
