/**
 * Footer - Copyright dan link bantuan
 * 
 * Design: Compact footer (p-4), border-top, text-xs
 */

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white mt-8">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-500">
              © {currentYear} Biro Organisasi. All rights reserved.
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Sistem Informasi SOP - Versi 1.2
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="#panduan"
              className="text-xs text-blue-600 hover:underline"
            >
              Panduan
            </a>
            <a
              href="#bantuan"
              className="text-xs text-blue-600 hover:underline"
            >
              Bantuan
            </a>
            <a
              href="#kontak"
              className="text-xs text-blue-600 hover:underline"
            >
              Kontak
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
