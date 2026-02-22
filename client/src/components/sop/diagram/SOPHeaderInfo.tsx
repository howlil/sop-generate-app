import { Input } from '@/components/ui/input'
import type { TTESignaturePayload } from '@/lib/types/tte'
import { TTESignatureBlock } from '@/components/tte/TTESignatureBlock'

export interface SOPHeaderInfoProps {
  name: string
  number?: string
  version?: number
  createdDate?: string
  revisionDate?: string
  effectiveDate?: string
  /** Logo lembaga (url/dataUrl). Jika kosong pakai default. */
  institutionLogo?: string
  /** Baris-baris nama/detail lembaga (maks 4 baris). Jika kosong pakai default. */
  institutionLines?: string[]
  picName: string
  picNumber: string
  picRole?: string
  lawBasis?: string[]
  implementQualification?: string[]
  relatedSop?: string[]
  equipment?: string[]
  warning?: string
  recordData?: string[]
  signature?: string
  /** Tanda tangan elektronik BSRE (jika SOP sudah disahkan dengan TTE). */
  tteSignaturePayload?: TTESignaturePayload | null
  editable?: boolean
  onMetadataChange?: (field: string, value: unknown) => void
}

export function SOPHeaderInfo({
  name,
  number = '',
  version = 1,
  createdDate = '',
  revisionDate = '',
  effectiveDate = '',
  institutionLogo = '',
  institutionLines = [],
  picName,
  picNumber,
  picRole = 'Penanggung Jawab',
  lawBasis = [],
  implementQualification = [],
  relatedSop = [],
  equipment = [],
  warning = '-',
  recordData = [],
  signature = '',
  tteSignaturePayload,
  editable = false,
  onMetadataChange,
}: SOPHeaderInfoProps) {
  const handleChange = (field: string, value: unknown) => {
    if (editable && onMetadataChange) onMetadataChange(field, value)
  }

  const formatDate = (d: string) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    if (day && m && y) return `${day}/${m}/${y.slice(2)}`
    return d
  }

  return (
    <div className="flex justify-center">
      <div className="px-4 lg:px-0 print:px-0 overflow-x-auto">
        <div className="print-page print-break-after-page w-full max-w-[calc(297mm-3cm)] min-w-0 box-border print:w-[calc(297mm-3cm)] print:min-w-[calc(297mm-3cm)] print:max-w-[calc(297mm-3cm)] print:my-0 print:mx-auto [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
          <table className="w-full border-collapse border-2 border-black text-sm bg-white table-fixed">
            <colgroup>
              <col style={{ width: '45%' }} />
              <col style={{ width: '26%' }} />
              <col style={{ width: '2%' }} />
              <col style={{ width: '27%' }} />
            </colgroup>
            <tbody>
              {/* Baris 1: Kolom kiri (rowspan 7) = logo + instansi */}
              <tr>
                <th
                  rowSpan={7}
                  className="border-2 py-0.5 px-2 border-black align-top bg-white min-w-0 break-words"
                >
                  <img
                    className="mx-auto h-36 my-4"
                    src={institutionLogo || "/logo_unand_kecil.png"}
                    alt="Logo OPD"
                  />
                  {institutionLines.length > 0 ? (
                    <div className="break-words min-w-0">
                      {institutionLines.slice(0, 4).map((line, idx) => (
                        <h4
                          key={idx}
                          className="font-semibold text-sm leading-tight break-words"
                        >
                          {line}
                        </h4>
                      ))}
                    </div>
                  ) : (
                    <div className="break-words min-w-0">
                      <h4 className="font-semibold text-sm leading-tight break-words">
                        PEMERINTAH KABUPATEN PADANG
                      </h4>
                      <h4 className="font-semibold text-sm leading-tight break-words">DINAS PENDIDIKAN</h4>
                      <h4 className="font-semibold text-sm leading-tight break-words">
                        BIDANG PENDIDIKAN DASAR
                      </h4>
                      <h4 className="font-semibold text-sm leading-tight break-words">
                        SEKSI KURIKULUM DAN PENILAIAN
                      </h4>
                    </div>
                  )}
                </th>
              </tr>
              <tr>
                <td className="font-semibold border-2 py-0.5 px-2 border-black whitespace-nowrap overflow-hidden">
                  NOMOR SOP
                </td>
                <td className="border-2 border-r-0 py-0.5 px-2 border-black text-center">:</td>
                <td className="border-2 border-l-0 py-0.5 px-2 border-black min-w-0 break-words">
                  {editable ? (
                    <Input
                      className="h-6 text-xs border-0 p-0 min-h-0 w-full bg-transparent break-words"
                      value={number}
                      onChange={(e) => handleChange('number', e.target.value)}
                    />
                  ) : (
                    <span className="break-words">{number || ' - '}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold border-2 py-0.5 px-2 border-black whitespace-nowrap overflow-hidden">
                  TANGGAL PEMBUATAN
                </td>
                <td className="border-2 border-r-0 py-0.5 px-2 border-black text-center">:</td>
                <td className="border-2 border-l-0 py-0.5 px-2 border-black min-w-0 break-words">
                  {editable ? (
                    <Input
                      type="date"
                      className="h-6 text-xs border-0 p-0 min-h-0 w-full bg-transparent"
                      value={createdDate}
                      onChange={(e) => handleChange('createdDate', e.target.value)}
                    />
                  ) : (
                    formatDate(createdDate)
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold border-2 py-0.5 px-2 border-black whitespace-nowrap overflow-hidden">
                  TANGGAL REVISI
                </td>
                <td className="border-2 border-r-0 py-0.5 px-2 border-black text-center">:</td>
                <td className="border-2 border-l-0 py-0.5 px-2 border-black min-w-0 break-words">
                  {editable ? (
                    <Input
                      type="date"
                      className="h-6 text-xs border-0 p-0 min-h-0 w-full bg-transparent"
                      value={revisionDate}
                      onChange={(e) => handleChange('revisionDate', e.target.value)}
                    />
                  ) : (
                    revisionDate && version > 1 ? formatDate(revisionDate) : ''
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold border-2 py-0.5 px-2 border-black whitespace-nowrap overflow-hidden">
                  TANGGAL EFEKTIF
                </td>
                <td className="border-2 border-r-0 py-0.5 px-2 border-black text-center">:</td>
                <td className="border-2 border-l-0 py-0.5 px-2 border-black min-w-0 break-words">
                  {editable ? (
                    <Input
                      type="date"
                      className="h-6 text-xs border-0 p-0 min-h-0 w-full bg-transparent"
                      value={effectiveDate}
                      onChange={(e) => handleChange('effectiveDate', e.target.value)}
                    />
                  ) : (
                    formatDate(effectiveDate)
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold align-top border-2 py-0.5 px-2 border-black whitespace-nowrap overflow-hidden">
                  DISAHKAN OLEH
                </td>
                <td className="align-top border-2 border-r-0 py-0.5 px-2 border-black text-center">:</td>
                <td className="text-center font-semibold border-2 border-l-0 py-0.5 px-2 border-black min-w-0 break-words">
                  <div className="min-h-[6rem]">
                    {tteSignaturePayload ? (
                      <TTESignatureBlock
                        payload={tteSignaturePayload}
                        roleLabel={picRole}
                        qrSize={72}
                      />
                    ) : (
                      <>
                        <p>{picRole},</p>
                        <div className="flex justify-center h-24 min-h-24">
                          {signature ? (
                            <img
                              src={signature}
                              alt="Tanda Tangan"
                              className="max-w-full max-h-24 object-contain"
                            />
                          ) : null}
                        </div>
                        <p>{picName}</p>
                        <p>NIP. {picNumber}</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="font-semibold align-top border-2 py-0.5 px-2 border-black whitespace-nowrap overflow-hidden">
                  SOP
                </td>
                <td className="border-2 border-r-0 py-0.5 px-2 border-black text-center">:</td>
                <td className="font-semibold border-2 border-l-0 py-0.5 px-2 border-black min-w-0 break-words">{name || ' - '}</td>
              </tr>

              {/* DASAR HUKUM | KUALIFIKASI PELAKSANAAN */}
              <tr>
                <td className="font-semibold border-2 py-0.5 px-2 border-black overflow-hidden">DASAR HUKUM</td>
                <td colSpan={3} className="font-semibold border-2 py-0.5 px-2 border-black overflow-hidden">
                  KUALIFIKASI PELAKSANAAN
                </td>
              </tr>
              <tr>
                <td className="align-top border-2 py-0.5 px-2 border-black min-w-0 break-words">
                  {lawBasis.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 text-left break-words">
                      {lawBasis.map((item, i) => (
                        <li key={i} className="break-words">{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
                <td colSpan={3} className="align-top border-2 py-0.5 px-2 border-black min-w-0 break-words">
                  {implementQualification.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 text-left break-words">
                      {implementQualification.map((item, i) => (
                        <li key={i} className="break-words">{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
              </tr>

              {/* KETERKAITAN | PERALATAN */}
              <tr>
                <td className="font-semibold border-2 py-0.5 px-2 border-black overflow-hidden">
                  KETERKAITAN DENGAN POS AP LAIN
                </td>
                <td colSpan={3} className="font-semibold border-2 py-0.5 px-2 border-black overflow-hidden">
                  PERALATAN / PERLENGKAPAN
                </td>
              </tr>
              <tr>
                <td className="align-top border-2 py-0.5 px-2 border-black min-w-0 break-words">
                  {relatedSop.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 text-left break-words">
                      {relatedSop.map((item, i) => (
                        <li key={i} className="break-words">{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
                <td colSpan={3} className="align-top border-2 py-0.5 px-2 border-black min-w-0 break-words">
                  {equipment.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 text-left columns-3 break-words">
                      {equipment.map((item, i) => (
                        <li key={i} className="break-words">{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
              </tr>

              {/* PERINGATAN | PENCATATAN DAN PENDATAAN */}
              <tr>
                <td className="font-semibold border-2 py-0.5 px-2 border-black overflow-hidden">PERINGATAN</td>
                <td colSpan={3} className="font-semibold border-2 py-0.5 px-2 border-black overflow-hidden">
                  PENCATATAN DAN PENDATAAN
                </td>
              </tr>
              <tr>
                <td className="align-top border-2 py-0.5 px-2 border-black min-w-0 break-words">
                  {warning ?? ''}
                </td>
                <td colSpan={3} className="align-top border-2 py-0.5 px-2 border-black min-w-0 break-words">
                  {recordData.length > 0 ? (
                    <ul className="list-none ml-0 text-left break-words space-y-1">
                      {recordData.map((item, i) => (
                        <li
                          key={i}
                          className="break-words"
                          style={{ paddingLeft: '1.25rem', textIndent: '-1.25rem' }}
                        >
                          - {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p> - </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
