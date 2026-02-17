import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: React.ReactNode
  valueClassName?: string
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  valueClassName = 'text-gray-900',
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4',
        className
      )}
    >
      {icon ? (
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs text-gray-700">{label}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-700 mb-2">{label}</p>
      )}
      <p className={cn('text-xl text-gray-900', valueClassName)}>{value}</p>
    </div>
  )
}
