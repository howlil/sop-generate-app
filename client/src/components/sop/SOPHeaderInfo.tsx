import { Input } from '@/components/ui/input'

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
        <div className="print-page print-break-after-page w-[calc(297mm-3cm)] min-w-[calc(297mm-3cm)] max-w-[calc(297mm-3cm)] box-border print:my-0 print:mx-auto [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
          <table className="w-full border-collapse border-2 border-black text-sm bg-white">
            <tbody>
              {/* Baris 1: Kolom kiri (rowspan 7) = logo + instansi */}
              <tr>
                <th
                  rowSpan={7}
                  className="w-[47%] border-2 py-0.5 px-2 border-black align-top bg-white"
                >
                  <img
                    className="mx-auto h-36 my-4"
                    src={institutionLogo || "/logo_unand_kecil.png"}
                    alt="Logo Kementerian Pendidikan Kebudayaan, Riset dan Teknologi"
                  />
                  {institutionLines.length > 0 ? (
                    <div>
                      {institutionLines.slice(0, 4).map((line, idx) => (
                        <h4
                          key={idx}
                          className={idx < 3 ? 'font-semibold text-sm leading-tight' : 'font-[450] text-sm leading-tight'}
                        >
                          {line}
                        </h4>
                      ))}
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold text-sm leading-tight">
                        KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                      </h4>
                      <h4 className="font-semibold text-sm leading-tight">UNIVERSITAS ANDALAS</h4>
                      <h4 className="font-semibold text-sm leading-tight">
                        FAKULTAS TEKNOLOGI INFORMASI
                      </h4>
                      <h4 className="font-[450] text-sm leading-tight">
                        DEPARTEMEN SISTEM INFORMASI
                      </h4>
                    </>
                  )}
                </th>
              </tr>
              <tr>
                <td className="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap w-0">
                  NOMOR SOP
                </td>
                <td className="border-2 py-0.5 px-2 border-black w-0">:</td>
                <td className="border-2 py-0.5 px-2 border-black">
                  {editable ? (
                    <Input
                      className="h-6 text-xs border-0 p-0 min-h-0 w-full bg-transparent"
                      value={number}
                      onChange={(e) => handleChange('number', e.target.value)}
                    />
                  ) : (
                    number || ' - '
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap">
                  TANGGAL PEMBUATAN
                </td>
                <td className="border-2 py-0.5 px-2 border-black">:</td>
                <td className="border-2 py-0.5 px-2 border-black">
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
                <td className="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap">
                  TANGGAL REVISI
                </td>
                <td className="border-2 py-0.5 px-2 border-black">:</td>
                <td className="border-2 py-0.5 px-2 border-black">
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
                <td className="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap">
                  TANGGAL EFEKTIF
                </td>
                <td className="border-2 py-0.5 px-2 border-black">:</td>
                <td className="border-2 py-0.5 px-2 border-black">
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
                <td className="font-bold align-top border-2 py-0.5 px-2 border-black whitespace-nowrap">
                  DISAHKAN OLEH
                </td>
                <td className="align-top border-2 py-0.5 px-2 border-black">:</td>
                <td className="text-center font-bold border-2 py-0.5 px-2 border-black">
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
                </td>
              </tr>
              <tr>
                <td className="font-bold align-top border-2 py-0.5 px-2 border-black whitespace-nowrap">
                  SOP
                </td>
                <td className="border-2 py-0.5 px-2 border-black">:</td>
                <td className="font-bold border-2 py-0.5 px-2 border-black">{name || ' - '}</td>
              </tr>

              {/* DASAR HUKUM | KUALIFIKASI PELAKSANAAN */}
              <tr>
                <td className="font-bold border-2 py-0.5 px-2 border-black">DASAR HUKUM</td>
                <td colSpan={3} className="font-bold border-2 py-0.5 px-2 border-black">
                  KUALIFIKASI PELAKSANAAN
                </td>
              </tr>
              <tr>
                <td className="align-top border-2 py-0.5 px-2 border-black">
                  {lawBasis.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 text-left">
                      {lawBasis.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
                <td colSpan={3} className="align-top border-2 py-0.5 px-2 border-black">
                  {implementQualification.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 text-left">
                      {implementQualification.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
              </tr>

              {/* KETERKAITAN | PERALATAN */}
              <tr>
                <td className="font-bold border-2 py-0.5 px-2 border-black">
                  KETERKAITAN DENGAN POS AP LAIN
                </td>
                <td colSpan={3} className="font-bold border-2 py-0.5 px-2 border-black">
                  PERALATAN / PERLENGKAPAN
                </td>
              </tr>
              <tr>
                <td className="align-top border-2 py-0.5 px-2 border-black">
                  {relatedSop.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 text-left">
                      {relatedSop.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
                <td colSpan={3} className="align-top border-2 py-0.5 px-2 border-black">
                  {equipment.length > 0 ? (
                    <ol className="list-decimal list-outside ml-5 columns-3 text-left">
                      {equipment.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p> - </p>
                  )}
                </td>
              </tr>

              {/* PERINGATAN | PENCATATAN DAN PENDATAAN */}
              <tr>
                <td className="font-bold border-2 py-0.5 px-2 border-black">PERINGATAN</td>
                <td colSpan={3} className="font-bold border-2 py-0.5 px-2 border-black">
                  PENCATATAN DAN PENDATAAN
                </td>
              </tr>
              <tr>
                <td className="align-top border-2 py-0.5 px-2 border-black">
                  {warning ?? ''}
                </td>
                <td colSpan={3} className="align-top border-2 py-0.5 px-2 border-black">
                  {recordData.length > 0 ? (
                    <ul className="list-none ml-0 text-left">
                      {recordData.map((item, i) => (
                        <li key={i}>- {item}</li>
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
