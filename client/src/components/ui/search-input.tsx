import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>, 'className'> {
  className?: string
  inputClassName?: string
}

export function SearchInput({ className, inputClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative flex-1 max-w-md', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        className={cn('h-9 pl-9 pr-3 text-xs', inputClassName)}
        {...props}
      />
    </div>
  )
}
