/**
 * Contact Section - Informasi Kontak
 * 
 * Design: 2-column layout dengan contact info dan map placeholder
 */
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const contactInfo = [
  {
    icon: MapPin,
    label: 'Alamat',
    value: 'Kantor Biro Organisasi\nPemerintah Daerah\nIndonesia',
  },
  {
    icon: Phone,
    label: 'Telepon',
    value: '(021) 1234-5678',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'biro.organisasi@pemda.go.id',
  },
  {
    icon: Clock,
    label: 'Jam Operasional',
    value: 'Senin - Jumat\n08:00 - 16:00 WIB',
  },
]

export function ContactSection() {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Hubungi Kami
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Silakan hubungi kami untuk informasi lebih lanjut
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-1">
                    {item.label}
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}

            {/* CTA Button */}
            <div className="pt-4">
              <a
                href="mailto:biro.organisasi@pemda.go.id"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
              >
                Kirim Email Sekarang
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Right Column - Map Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="h-[300px] bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Peta Lokasi
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  (Map integration placeholder)
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
