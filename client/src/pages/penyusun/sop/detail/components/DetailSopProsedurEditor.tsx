import { MoreHorizontal, Settings2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useProsedurEditor } from '@/hooks/useProsedurEditor'
import { useToast } from '@/hooks/useToast'
import {
  KegiatanCell,
  TypeCell,
  ImplementerCell,
  MutuKelengkapanCell,
  MutuWaktuCell,
  OutputCell,
  KeteranganCell,
} from './ProsedurEditorCells'
import { DecisionStepDialog } from './DecisionStepDialog'
import type { ProsedurRow } from '@/types/ui/sop'

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
  const {
    // Dialog state
    isDecisionDialogOpen,
    setIsDecisionDialogOpen,
    decisionStepIndex,
    decisionYesId,
    decisionNoId,
    setDecisionYesId,
    setDecisionNoId,
    
    // Row operations
    handleAddRow,
    handleDeleteRow,
    handleTypeChange,
    handleKegiatanChange,
    handlePelaksanaChange,
    handleMutuKelengkapanChange,
    handleMutuWaktuChange,
    handleOutputChange,
    handleKeteranganChange,
    handleDecisionConfig,
  } = useProsedurEditor(prosedurRows, setProsedurRows)

  const hasImplementers = implementers.length > 0
  const stepOrderById = Object.fromEntries(
    prosedurRows.map((row, idx) => [row.id, idx + 1]),
  ) as Record<string, number>
  const guardedAddRow = (index: number) => {
    if (!hasImplementers) {
      showToast(
        'Tambahkan minimal satu aktor pelaksana terlebih dahulu sebelum menambah langkah.',
        'error',
      )
      return
    }
    handleAddRow(index, implementers)
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden mb-3">
        <p className="text-xs font-semibold text-gray-900">Edit langkah / prosedur</p>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] text-gray-500">No akan otomatis mengikuti urutan baris.</p>
      </div>
      <Table.Paginated data={prosedurRows} label="langkah" className="border border-gray-200 rounded-lg">
        {(pageData, startIndex) => (
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
              {pageData.map((row, localIdx) => {
                const realIdx = startIndex + localIdx
                return (
                  <Table.BodyRow key={row.id} className="align-top">
                    <Table.Td className="px-1 py-1 text-center align-middle">{realIdx + 1}</Table.Td>
                    <Table.Td className="px-1 py-1">
                      <KegiatanCell
                        value={row.kegiatan}
                        onChange={(value) => handleKegiatanChange(realIdx, value)}
                      />
                    </Table.Td>
                    <Table.Td className="px-1 py-1">
                      <TypeCell
                        row={row}
                        index={realIdx}
                        totalRows={prosedurRows.length}
                        stepOrderById={stepOrderById}
                        onTypeChange={(type, role) => handleTypeChange(realIdx, type, role)}
                      />
                    </Table.Td>
                    <Table.Td className="px-1 py-1">
                      <ImplementerCell
                        row={row}
                        implementers={implementers}
                        onImplementerChange={(id) => handlePelaksanaChange(realIdx, id, implementers)}
                      />
                    </Table.Td>
                    <Table.Td className="px-1 py-1">
                      <MutuKelengkapanCell
                        value={row.mutu_kelengkapan ?? ''}
                        onChange={(value) => handleMutuKelengkapanChange(realIdx, value)}
                      />
                    </Table.Td>
                    <Table.Td className="px-1 py-1">
                      <MutuWaktuCell
                        value={row.mutu_waktu ?? ''}
                        onChange={(amount, unit) => handleMutuWaktuChange(realIdx, amount, unit)}
                      />
                    </Table.Td>
                    <Table.Td className="px-1 py-1">
                      <OutputCell
                        value={row.output ?? ''}
                        onChange={(value) => handleOutputChange(realIdx, value)}
                      />
                    </Table.Td>
                    <Table.Td className="px-1 py-1">
                      <KeteranganCell
                        value={row.keterangan ?? ''}
                        onChange={(value) => handleKeteranganChange(realIdx, value)}
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
                              onClick={() => handleDecisionConfig(realIdx, row.id_next_step_if_yes || '', row.id_next_step_if_no || '')}
                            >
                              <Settings2 className="w-3 h-3 mr-1.5 text-gray-500" />
                              <span>Atur cabang decision</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => guardedAddRow(realIdx)}
                          >
                            <span className="mr-1.5 text-blue-600">+</span>
                            <span>Tambah langkah setelah ini</span>
                          </DropdownMenuItem>
                          {prosedurRows.length > 1 ? (
                            <DropdownMenuItem
                              onClick={() => handleDeleteRow(realIdx)}
                              className="text-red-600 focus:text-red-600"
                              title="Hapus langkah"
                            >
                              <X className="w-3 h-3 mr-1.5 shrink-0" aria-hidden />
                              <span>Hapus langkah</span>
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Table.Td>
                  </Table.BodyRow>
                )
              })}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>
      <div className="flex justify-between items-center mt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => guardedAddRow(prosedurRows.length)}
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
        onValidationError={() => {}}
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
      />
    </div>
  )
}
