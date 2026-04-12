import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/utils/cn";

interface SearchToolbarBaseProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Toolbar container for search input + action buttons.
 * Usage (children mode):
 *   <SearchToolbar>
 *     <SearchInput ... />
 *     <Button>Filter</Button>
 *   </SearchToolbar>
 *
 * Usage (convenience props mode):
 *   <SearchToolbar
 *     searchPlaceholder="Cari..."
 *     searchValue={query}
 *     onSearchChange={setQuery}
 *   >
 *     <Button>Filter</Button>
 *   </SearchToolbar>
 */
export function SearchToolbar({
  children,
  className,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: SearchToolbarBaseProps & {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-2 flex-wrap",
        className,
      )}
    >
      {searchPlaceholder != null ? (
        <SearchInput
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
      ) : null}
      {children != null ? (
        <div className="ml-auto flex gap-2 flex-wrap">{children}</div>
      ) : null}
    </div>
  );
}
