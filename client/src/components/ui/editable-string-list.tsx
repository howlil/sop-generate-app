/**
 * Reusable inline-editable list of strings (add, edit, remove).
 * Replaces the repeated pattern in DetailSOPMetadataPanel.
 */
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EditableStringListProps {
  items: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  emptyMessage?: string
  addLabel?: string
}

export function EditableStringList({
  items,
  onChange,
  placeholder = '',
  emptyMessage = 'Belum ada item. Klik "Tambah" untuk menambahkan.',
  addLabel = 'Tambah',
}: EditableStringListProps) {
  const handleAdd = () => onChange([...items, ''])

  const handleChange = (idx: number, value: string) => {
    const next = [...items]
    next[idx] = value
    onChange(next)
  }

  const handleRemove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAdd}>
          {addLabel}
        </Button>
      </div>
      <div className="space-y-2 mt-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              className="h-9 text-xs flex-1"
              value={item}
              onChange={(e) => handleChange(idx, e.target.value)}
              placeholder={placeholder ? `${placeholder} ${idx + 1}` : undefined}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-500 hover:text-red-600"
              onClick={() => handleRemove(idx)}
              title="Hapus"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[11px] text-gray-500">{emptyMessage}</p>
        )}
      </div>
    </>
  )
}
