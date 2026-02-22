import { useState } from 'react'
import { SOPHeaderInfo } from '@/components/sop/SOPHeaderInfo'
import { SOPDiagram, type ProsedurRow } from '@/components/sop/SOPDiagram'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TTESignaturePayload } from '@/lib/tte-types'

const DEFAULT_IMPLEMENTERS = [
  { id: 'impl-1', name: 'Pemohon / Mahasiswa' },
  { id: 'impl-2', name: 'Admin Prodi' },
  { id: 'impl-3', name: 'Kaprodi' },
  { id: 'impl-4', name: 'Dekan' },
  { id: 'impl-5', name: 'Kabag. Akademik' },
]

const DEFAULT_PROSEDUR_ROWS: ProsedurRow[] = [
  { id: '1', no: 1, kegiatan: 'Pemohon mengisi formulir pengajuan online', pelaksana: { 'impl-1': '√', 'impl-2': '', 'impl-3': '', 'impl-4': '', 'impl-5': '' }, mutu_kelengkapan: 'Formulir terisi lengkap', mutu_waktu: '5 Menit', output: 'Draft pengajuan', keterangan: 'Pemohon memulai proses.' },
  { id: '2', no: 2, kegiatan: 'Admin Prodi verifikasi berkas dan kelengkapan', pelaksana: { 'impl-1': '', 'impl-2': '√', 'impl-3': '', 'impl-4': '', 'impl-5': '' }, mutu_kelengkapan: 'Checklist verifikasi', mutu_waktu: '15 Menit', output: 'Status verifikasi', keterangan: 'Cek kelengkapan dokumen.' },
  { id: '3', no: 3, type: 'decision', kegiatan: 'Berkas lengkap?', pelaksana: { 'impl-1': '', 'impl-2': '√', 'impl-3': '', 'impl-4': '', 'impl-5': '' }, mutu_kelengkapan: '-', mutu_waktu: '-', output: '-', keterangan: 'Jika tidak lengkap kembali ke verifikasi.', id_next_step_if_yes: '4', id_next_step_if_no: '2' },
  { id: '4', no: 4, kegiatan: 'Kaprodi review substansi pengajuan', pelaksana: { 'impl-1': '', 'impl-2': '', 'impl-3': '√', 'impl-4': '', 'impl-5': '' }, mutu_kelengkapan: 'Dokumen final', mutu_waktu: '1 Hari', output: 'Catatan review', keterangan: 'Review isi dokumen.' },
  { id: '5', no: 5, kegiatan: 'Dekan menandatangani dan mengesahkan', pelaksana: { 'impl-1': '', 'impl-2': '', 'impl-3': '', 'impl-4': '√', 'impl-5': '' }, mutu_kelengkapan: 'Dokumen siap tanda tangan', mutu_waktu: '1 Hari', output: 'Dokumen disahkan', keterangan: 'Final approval.' },
]

export interface SOPPreviewTemplateProps {
  /** Override nama SOP (default: Percobaan) */
  name?: string
  /** Override nomor SOP */
  number?: string
  /** TTE signature payload jika SOP sudah disahkan */
  tteSignaturePayload?: TTESignaturePayload | null
  /** Sembunyikan tab Flowchart/BPMN (hanya tampil flowchart) */
  hideDiagramTabs?: boolean
}

export function SOPPreviewTemplate({
  name: nameOverride,
  number: numberOverride,
  tteSignaturePayload = null,
  hideDiagramTabs = false,
}: SOPPreviewTemplateProps) {
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')

  const metadata = {
    name: nameOverride ?? 'Percobaan',
    number: numberOverride ?? 'T.001/UN15/KP.01.00/2024',
    version: 3,
    createdDate: '2024-11-27',
    revisionDate: '2026-02-10',
    effectiveDate: '2024-11-27',
    picName: 'Dr. Ahmad Fauzi, M.Kom',
    picNumber: '198505102010121001',
    picRole: 'Penanggung Jawab',
    section: 'Layanan Akademik',
    lawBasis: ['Peraturan Daerah Kota Padang Nomor 28 Tahun 2018 tentang Keterbukaan Informasi Publik'],
    implementQualification: ['Riset'],
    relatedSop: [],
    equipment: [],
    warning: '-',
    recordData: [],
    signature: '',
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="sop-a4-preview p-2">
        <div className="space-y-8">
          <SOPHeaderInfo {...metadata} editable={false} tteSignaturePayload={tteSignaturePayload} />

          {!hideDiagramTabs && (
            <div className="flex justify-center print:hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'flowchart' | 'bpmn')} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="flowchart" className="text-xs">Flowchart</TabsTrigger>
                  <TabsTrigger value="bpmn" className="text-xs">BPMN</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="w-full">
            <SOPDiagram
              rows={DEFAULT_PROSEDUR_ROWS}
              implementers={DEFAULT_IMPLEMENTERS}
              diagramType={activeTab}
              name={metadata.name}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
