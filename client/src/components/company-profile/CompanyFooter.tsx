/**
 * Company Footer - Footer company profile
 * 
 * Design: 3-column layout dengan quick links, legal, dan social media
 */

const quickLinks = [
  { label: 'Beranda', href: '#' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Layanan', href: '#layanan' },
  { label: 'Kontak', href: '#kontak' },
]

const legalLinks = [
  { label: 'Kebijakan Privasi', href: '#privacy' },
  { label: 'Syarat Layanan', href: '#terms' },
]

export function CompanyFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Column 1 - About */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              Biro Organisasi
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Mengelola Standard Operating Procedure untuk pelayanan publik 
              yang lebih baik dan terstandarisasi.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              Tautan Cepat
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center md:text-left">
            © {currentYear} Biro Organisasi. All rights reserved.
          </p>

          {/* Version */}
          <p className="text-xs text-gray-600">
            Sistem Informasi SOP v1.2
          </p>

        </div>
      </div>
    </footer>
  )
}
