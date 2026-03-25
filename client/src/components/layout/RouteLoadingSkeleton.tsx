import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder ringan saat transisi rute (pending). */
export function RouteLoadingSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto" aria-busy="true" aria-label="Memuat halaman">
      <Skeleton className="h-8 w-48 rounded-md" />
      <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}
