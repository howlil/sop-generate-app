import { useState } from 'react'
import { X, MoreHorizontal, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/useUI'
import type { ProsedurRow } from '@/lib/types/sop'
import { DecisionStepDialog } from './DecisionStepDialog'

export interface DetailSOPProsedurEditorProps {
  prosedurRows: ProsedurRow[]
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>
  implementers: { id: string; name: string }[]
  onDone: () => void
}

export function DetailSOPProsedurEditor({
  prosedurRows,
  setProsedurRows,
  implementers,
  onDone,
}: DetailSOPProsedurEditorProps) {
  const { showToast } = useToast()
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false)
  const [decisionStepIndex, setDecisionStepIndex] = useState<number | null>(null)
  const [decisionYesId, setDecisionYesId] = useState<string>('')
  const [decisionNoId, setDecisionNoId] = useState<string>('')

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden mb-3">
        <p className="text-xs font-semibold text-gray-900">Edit langkah / prosedur</p>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] text-gray-500">No akan otomatis mengikuti urutan baris.</p>
      </div>
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <Table.Table>
          <thead className="bg-gray-50 border-b border-gray-200">
            <Table.HeadRow>
              <Table.Th className="px-1 py-1 w-10">No</Table.Th>
              <Table.Th className="px-1 py-1 w-[28%]">Kegiatan</Table.Th>
              <Table.Th className="px-1 py-1 w-[12%]">Tipe</Table.Th>
              <Table.Th className="px-1 py-1 w-[14%]">Pelaksana</Table.Th>
              <Table.Th className="px-1 py-1 w-[13%]">Kelengkapan</Table.Th>
              <Table.Th className="px-1 py-1 w-[8%]">Waktu</Table.Th>
              <Table.Th className="px-1 py-1 w-[12%]">Output</Table.Th>
              <Table.Th className="px-1 py-1 w-[23%]">Keterangan</Table.Th>
              <Table.Th align="center" className="px-0.5 py-1 w-10">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {prosedurRows.map((row, idx) => (
              <Table.BodyRow key={row.id} className="align-top">
                <Table.Td className="px-1 py-1 text-center align-middle">{idx + 1}</Table.Td>
                <Table.Td className="px-1 py-1">
                  <Textarea
                    className="text-xs min-h-[40px] px-1.5 py-1"
                    value={row.kegiatan}
                    onChange={(e) =>
                      setProsedurRows((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, kegiatan: e.target.value } : r
                        )
                      )
                    }
                  />
                </Table.Td>
                <Table.Td className="px-1 py-1">
                  {(() => {
                    const yesIndex = row.id_next_step_if_yes
                      ? prosedurRows.findIndex((r) => r.id === row.id_next_step_if_yes)
                      : -1
                    const noIndex = row.id_next_step_if_no
                      ? prosedurRows.findIndex((r) => r.id === row.id_next_step_if_no)
                      : -1
                    const hasDecisionTarget = yesIndex !== -1 || noIndex !== -1
                    return (
                      <div className="space-y-1">
                        <select
                          className="w-full h-8 rounded-md border border-gray-200 px-0.5 text-xs"
                          value={
                            row.type ||
                            (idx === 0 || idx === prosedurRows.length - 1 ? 'terminator' : 'task')
                          }
                          onChange={(e) =>
                            setProsedurRows((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, type: e.target.value as ProsedurRow['type'] } : r
                              )
                            )
                          }
                        >
                          <option value="task">Task</option>
                          <option value="decision">Decision</option>
                          <option value="terminator">
                            {idx === 0
                              ? 'Start'
                              : idx === prosedurRows.length - 1
                                ? 'End'
                                : 'Terminator'}
                          </option>
                        </select>
                        {row.type === 'decision' && (
                          <p className="text-[10px] text-gray-500">
                            {!hasDecisionTarget
                              ? 'Belum diatur cabang Ya/Tidak.'
                              : [yesIndex !== -1 ? `Ya → ${yesIndex + 1}` : null, noIndex !== -1 ? `Tidak → ${noIndex + 1}` : null]
                                  .filter(Boolean)
                                  .join(' • ')}
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </Table.Td>
                <Table.Td className="px-1 py-1">
                  <select
                    className="w-full h-8 rounded-md border border-gray-200 px-0.5 text-xs"
                    value={
                      Object.keys(row.pelaksana).find((k) => row.pelaksana[k]) ||
                      implementers[0]?.id ||
                      ''
                    }
                    onChange={(e) => {
                      const id = e.target.value
                      const nextPelaksana: Record<string, string> = {}
                      implementers.forEach((impl) => {
                        nextPelaksana[impl.id] = impl.id === id ? '√' : ''
                      })
                      setProsedurRows((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, pelaksana: nextPelaksana } : r
                        )
                      )
                    }}
                  >
                    {implementers.map((impl) => (
                      <option key={impl.id} value={impl.id}>
                        {impl.name}
                      </option>
                    ))}
                  </select>
                </Table.Td>
                <Table.Td className="px-1 py-1">
                  <Textarea
                    className="text-xs min-h-[36px] px-1.5 py-1"
                    value={row.mutu_kelengkapan}
                    onChange={(e) =>
                      setProsedurRows((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, mutu_kelengkapan: e.target.value } : r
                        )
                      )
                    }
                  />
                </Table.Td>
                <Table.Td className="px-1 py-1">
                  {(() => {
                    const match = (row.mutu_waktu || '').match(/^(\d+)\s*(\w+)?/i)
                    const amount = match ? match[1] : ''
                    const rawUnit = match && match[2] ? match[2].toLowerCase() : ''
                    const unitFromLabel = rawUnit.startsWith('menit')
                      ? 'm'
                      : rawUnit.startsWith('jam')
                        ? 'h'
                        : rawUnit.startsWith('hari')
                          ? 'd'
                          : rawUnit.startsWith('minggu')
                            ? 'w'
                            : rawUnit.startsWith('bulan')
                              ? 'mo'
                              : 'm'
                    const unit = unitFromLabel
                    const unitLabelMap: Record<string, string> = {
                      m: 'Menit',
                      h: 'Jam',
                      d: 'Hari',
                      w: 'Minggu',
                      mo: 'Bulan',
                    }
                    const updateMutuWaktu = (nextAmount: string, nextUnit: string) => {
                      const label = unitLabelMap[nextUnit] || ''
                      const value = nextAmount ? `${nextAmount} ${label}` : ''
                      setProsedurRows((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, mutu_waktu: value } : r
                        )
                      )
                    }
                    return (
                      <div className="flex items-center gap-0 rounded-md border border-gray-200 [&_input]:rounded-r-none [&_input]:border-r-0 [&_input]:focus-visible:ring-0 [&_input]:focus-visible:ring-offset-0">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 text-xs w-10 rounded-l-md"
                          value={amount}
                          onChange={(e) => updateMutuWaktu(e.target.value, unit)}
                        />
                        <select
                          className="h-8 w-16 min-w-0 rounded-r-md border-0 border-l border-gray-200 bg-transparent pl-1 pr-5 text-xs outline-none focus:ring-0 focus:ring-offset-0"
                          value={unit}
                          onChange={(e) => updateMutuWaktu(amount, e.target.value)}
                        >
                          <option value="m">Menit</option>
                          <option value="h">Jam</option>
                          <option value="d">Hari</option>
                          <option value="w">Minggu</option>
                          <option value="mo">Bulan</option>
                        </select>
                      </div>
                    )
                  })()}
                </Table.Td>
                <Table.Td className="px-1 py-1">
                  <Textarea
                    className="text-xs min-h-[36px] px-1.5 py-1"
                    value={row.output}
                    onChange={(e) =>
                      setProsedurRows((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, output: e.target.value } : r
                        )
                      )
                    }
                  />
                </Table.Td>
                <Table.Td className="px-1 py-1">
                  <Textarea
                    className="text-xs min-h-[36px] px-1.5 py-1"
                    value={row.keterangan}
                    onChange={(e) =>
                      setProsedurRows((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, keterangan: e.target.value } : r
                        )
                      )
                    }
                  />
                </Table.Td>
                <Table.Td className="px-0.5 py-1 text-center align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        title="Aksi langkah"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[9rem]">
                      {row.type === 'decision' && (
                        <DropdownMenuItem
                          onClick={() => {
                            setDecisionStepIndex(idx)
                            const yesId = row.id_next_step_if_yes || ''
                            const noId = row.id_next_step_if_no || ''
                            setDecisionYesId(yesId)
                            setDecisionNoId(noId === yesId && yesId ? '' : noId)
                            setIsDecisionDialogOpen(true)
                          }}
                        >
                          <Settings2 className="w-3 h-3 mr-1.5 text-gray-500" />
                          <span>Atur cabang decision</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() =>
                          setProsedurRows((prev) => {
                            const idBase = crypto.randomUUID()
                            const newRow: ProsedurRow = {
                              id: `${idBase}-${idx + 1}`,
                              no: idx + 2,
                              kegiatan: '',
                              pelaksana: implementers.reduce(
                                (acc, impl, i2) => ({
                                  ...acc,
                                  [impl.id]: i2 === 0 ? '√' : '',
                                }),
                                {} as Record<string, string>
                              ),
                              mutu_kelengkapan: '',
                              mutu_waktu: '',
                              output: '',
                              keterangan: '',
                            }
                            const next = [...prev]
                            next.splice(idx + 1, 0, newRow)
                            return next.map((r, i2) => ({ ...r, no: i2 + 1 }))
                          })
                        }
                      >
                        <span className="mr-1.5 text-blue-600">+</span>
                        <span>Tambah langkah setelah ini</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={prosedurRows.length === 1}
                        onClick={() =>
                          setProsedurRows((prev) =>
                            prev.filter((_, i) => i !== idx).map((r, i2) => ({
                              ...r,
                              no: i2 + 1,
                            }))
                          )
                        }
                        className="text-red-600 data-[disabled]:text-gray-400"
                        title="Hapus langkah"
                      >
                        <X className="w-3 h-3" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Table.Td>
              </Table.BodyRow>
            ))}
          </tbody>
        </Table.Table>
      </div>
      <div className="flex justify-between items-center mt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() =>
            setProsedurRows((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                id_step: crypto.randomUUID(),
                no: prev.length + 1,
                kegiatan: '',
                pelaksana: implementers.reduce(
                  (acc, impl, idx) => ({
                    ...acc,
                    [impl.id]: idx === 0 ? '√' : '',
                  }),
                  {} as Record<string, string>
                ),
                mutu_kelengkapan: '',
                mutu_waktu: '',
                output: '',
                keterangan: '',
              },
            ])
          }
        >
          Tambah langkah
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-7 text-[11px] px-2"
          onClick={onDone}
        >
          Selesai edit
        </Button>
      </div>

      <DecisionStepDialog
        open={isDecisionDialogOpen}
        onOpenChange={setIsDecisionDialogOpen}
        decisionStepIndex={decisionStepIndex}
        prosedurRows={prosedurRows}
        decisionYesId={decisionYesId}
        decisionNoId={decisionNoId}
        setDecisionYesId={setDecisionYesId}
        setDecisionNoId={setDecisionNoId}
        onSave={(stepIndex, yesId, noId) => {
          setProsedurRows((prev) =>
            prev.map((row, idx) =>
              idx === stepIndex
                ? {
                    ...row,
                    id_next_step_if_yes: yesId || undefined,
                    id_next_step_if_no: noId || undefined,
                  }
                : row
            )
          )
        }}
        onValidationError={(message) => showToast(message, 'error')}
      />
    </div>
  )
}
