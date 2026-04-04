import { Link } from '@tanstack/react-router'
import { FileText, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Sistem Informasi SOP</h1>
              <p className="text-xs text-gray-500">Biro Organisasi</p>
            </div>
          </div>
          <Link to="/auth/login">
            <Button variant="default" size="sm">
              Masuk
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900">
            Kelola SOP Secara Digital
          </h2>
          <p className="text-gray-600 text-lg">
            Platform terintegrasi untuk penyusunan, evaluasi, dan pengesahan Standar Operasional Prosedur dengan jejak audit yang lengkap.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link to="/auth/login">
              <Button variant="default" size="lg">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Penyusunan SOP</h3>
            <p className="text-sm text-gray-600">
              Tim Penyusun dapat membuat dan mengedit SOP sesuai prosedur baku dengan mudah.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Evaluasi & Verifikasi</h3>
            <p className="text-sm text-gray-600">
              Biro Organisasi dan Tim Evaluasi melakukan penilaian dan verifikasi SOP secara terstruktur.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Pengesahan Digital</h3>
            <p className="text-sm text-gray-600">
              Kepala OPD mengesahkan SOP dengan tanda tangan elektronik yang aman dan teraudit.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sistem Informasi SOP — Biro Organisasi
        </div>
      </footer>
    </div>
  )
}
