/**
 * Features Table - Tabel fitur sistem dengan aktor terkait
 * 
 * Design: Compact table (text-xs), border-gray-200, hover states
 */

const features = [
  {
    fitur: 'Manajemen SOP',
    deskripsi: 'Kelola siklus hidup dokumen SOP dari draft hingga berlaku',
    aktor: 'Tim Penyusun',
  },
  {
    fitur: 'Evaluasi SOP',
    deskripsi: 'Penilaian kualitas dokumen SOP oleh Tim Evaluasi',
    aktor: 'Tim Evaluasi',
  },
  {
    fitur: 'Verifikasi Berita Acara',
    deskripsi: 'Verifikasi dan TTE Berita Acara evaluasi',
    aktor: 'Biro Organisasi',
  },
  {
    fitur: 'Pengesahan SOP',
    deskripsi: 'Pengesahan SOP menjadi dokumen berlaku',
    aktor: 'Kepala OPD',
  },
  {
    fitur: 'TTD Elektronik',
    deskripsi: 'Tanda tangan elektronik dengan PIN untuk BA dan SOP',
    aktor: 'Semua Aktor',
  },
  {
    fitur: 'Manajemen OPD',
    deskripsi: 'Kelola data Organisasi Perangkat Daerah',
    aktor: 'Biro Organisasi',
  },
  {
    fitur: 'Manajemen Tim',
    deskripsi: 'Kelola Tim Penyusun dan Tim Evaluasi',
    aktor: 'Biro Organisasi',
  },
  {
    fitur: 'Monitoring OPD',
    deskripsi: 'Grafik evaluasi tahunan per OPD',
    aktor: 'Biro Organisasi',
  },
  {
    fitur: 'Audit Trail',
    deskripsi: 'Jejak audit lengkap untuk setiap perubahan status',
    aktor: 'Semua Aktor',
  },
]

export function FeaturesTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-3 text-xs font-semibold text-gray-700">
              Fitur
            </th>
            <th className="text-left p-3 text-xs font-semibold text-gray-700">
              Deskripsi
            </th>
            <th className="text-left p-3 text-xs font-semibold text-gray-700">
              Aktor
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((row, index) => (
            <tr
              key={row.fitur}
              className={`border-b border-gray-100 hover:bg-gray-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              <td className="p-3 text-xs font-medium text-gray-900">
                {row.fitur}
              </td>
              <td className="p-3 text-xs text-gray-600">
                {row.deskripsi}
              </td>
              <td className="p-3 text-xs text-gray-700">
                {row.aktor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
