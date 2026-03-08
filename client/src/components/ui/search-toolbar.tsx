import { SearchInput } from '@/components/ui/search-input'

interface SearchToolbarProps {
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
  className?: string
}

export function SearchToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  children,
  className = '',
}: SearchToolbarProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-2 flex-wrap ${className}`.trim()}>
      <SearchInput
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
      />
      {children != null ? (
        <div className="ml-auto flex gap-2 flex-wrap">{children}</div>
      ) : null}
    </div>
  )
}
