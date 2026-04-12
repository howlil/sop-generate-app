/**
 * Landing Page — Sistem Informasi SOP Biro Organisasi
 *
 * Sections:
 * 1. Header (sticky nav)
 * 2. Hero (headline + CTA)
 * 3. Stats (key metrics)
 * 4. How It Works (workflow steps)
 * 5. Features (per-role benefits)
 * 6. CTA Banner
 * 7. Footer
 */
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'
import logoSvg from '@/assets/logo.svg'
import {
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  TrendingUp,
  FileCheck,
  Search,
  PenTool,
  Send,
  Award,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

// ==================== DATA ====================

const stats = [
  { value: '15+', label: 'SOP Berlaku per Bulan', icon: FileCheck },
  { value: '5', label: 'Role Terintegrasi', icon: Users },
  { value: '100%', label: 'Jejak Audit Digital', icon: Shield },
  { value: '3x', label: 'Lebih Cepat dari Manual', icon: TrendingUp },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Susun',
    description: 'Tim Penyusun membuat SOP dengan editor prosedur berbasis swimlane yang intuitif.',
    icon: PenTool,
    color: 'blue',
  },
  {
    step: '02',
    title: 'Evaluasi',
    description: 'Tim Evaluasi menilai kesesuaian SOP terhadap standar yang berlaku secara terstruktur.',
    icon: Search,
    color: 'amber',
  },
  {
    step: '03',
    title: 'Verifikasi',
    description: 'Biro Organisasi memverifikasi hasil evaluasi dan memastikan kualitas SOP.',
    icon: CheckCircle,
    color: 'green',
  },
  {
    step: '04',
    title: 'Sahkan',
    description: 'Kepala OPD mengesahkan SOP dengan tanda tangan elektronik yang aman dan teraudit.',
    icon: Award,
    color: 'purple',
  },
]

const roleBenefits = [
  {
    role: 'Tim Penyusun',
    description: 'Fokus pada substansi, bukan administrasi. Editor prosedur visual membuat penyusunan SOP jadi lebih mudah.',
    features: ['Editor prosedur drag-and-drop', 'Preview SOP real-time', 'Template siap pakai', 'Kolaborasi tim'],
    icon: FileText,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    role: 'Tim Evaluasi',
    description: 'Penilaian terstruktur dengan rubrik yang jelas. Tidak ada lagi evaluasi yang subjektif atau tidak konsisten.',
    features: ['Rubrik evaluasi standar', 'Dashboard tugas', 'Riwayat penilaian', 'Catatan terstruktur'],
    icon: Search,
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    role: 'Biro Organisasi',
    description: 'Pantau seluruh proses evaluasi dari hulu ke hilir. Verifikasi BA dengan satu klik.',
    features: ['Grafik evaluasi tahunan', 'Manajemen tim', 'Verifikasi BA digital', 'Laporan otomatis'],
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-600',
  },
  {
    role: 'Kepala OPD',
    description: 'Pantau progres SOP di OPD Anda. Sahkan dokumen kapan saja, di mana saja, secara digital.',
    features: ['Dashboard pantauan', 'Pengesahan digital', 'Riwayat TTE', 'Arsip terjamin'],
    icon: Award,
    gradient: 'from-purple-500 to-purple-600',
  },
]

const faqs = [
  {
    question: 'Apa itu Sistem Informasi SOP?',
    answer: 'Platform digital terintegrasi untuk mengelola seluruh siklus hidup SOP — mulai dari penyusunan, evaluasi, verifikasi, hingga pengesahan dengan tanda tangan elektronik.',
  },
  {
    question: 'Siapa saja yang bisa menggunakan sistem ini?',
    answer: 'Sistem ini dirancang untuk 5 peran: Tim Penyusun, Koordinator Tim Penyusun, Tim Evaluasi, Biro Organisasi, dan Kepala OPD. Setiap peran memiliki dashboard dan fitur yang disesuaikan.',
  },
  {
    question: 'Bagaimana keamanan tanda tangan elektronik?',
    answer: 'Tanda tangan elektronik menggunakan sistem TTE (Tanda Tangan Elektronik) BSRE dengan PIN verifikasi dan jejak audit yang lengkap. Setiap penandatanganan tercatat dengan timestamp dan identitas penandatangan.',
  },
  {
    question: 'Apakah data SOP tersimpan aman?',
    answer: 'Ya. Seluruh data tersimpan di database terenkripsi dengan backup berkala. Setiap perubahan SOP tercatat dalam audit trail yang tidak dapat diubah.',
  },
]

// ==================== COMPONENTS ====================

function ColorIcon({ icon: Icon, color }: { icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  return (
    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorMap[color] || colorMap.blue)}>
      <Icon className="w-6 h-6" />
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div className={cn('overflow-hidden transition-all duration-200', open ? 'max-h-48' : 'max-h-0')}>
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

// ==================== PAGE ====================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Logo" className="w-9 h-9" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-900 leading-tight">Sistem Informasi SOP</h1>
              <p className="text-[11px] text-gray-500 leading-tight">Biro Organisasi</p>
            </div>
          </div>
          <Link to={ROUTES.AUTH.LOGIN}>
            <Button variant="default" size="sm" className="h-8 text-xs">
              Masuk
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-44">
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"

        <div className="relative flex items-center gap-2 border border-blue-300 hover:border-blue-400/70 rounded-full w-max mx-auto px-4 py-2 mt-40 md:mt-32">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Platform Digital Terintegrasi</span>
        </div>

        <h2 className="relative text-4xl md:text-7xl font-bold max-w-[850px] text-center mx-auto mt-8 text-gray-900 leading-tight tracking-tight">
          Kelola SOP Lebih Cepat,{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Transparan, dan Terukur
          </span>
        </h2>

        <p className="relative text-sm md:text-base mx-auto max-w-2xl text-center mt-6 text-gray-600 leading-relaxed max-md:px-2">
          Dari penyusunan hingga pengesahan — seluruh proses SOP terdigitalisasi dengan jejak audit yang lengkap.
          Tidak ada lagi dokumen hilang, versi membingungkan, atau proses yang tidak terlacak.
        </p>

        <div className="relative mx-auto w-full flex items-center justify-center gap-3 mt-4">
          <Link to={ROUTES.AUTH.LOGIN}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2">
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <a href="#cara-kerja">
            <button className="flex items-center gap-2 border border-blue-300 hover:bg-blue-50 rounded-full px-6 py-3">
              <span>Lihat Cara Kerja</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </a>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-y border-gray-200 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="cara-kerja" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Cara Kerja</h3>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Empat langkah terstruktur dari penyusunan hingga SOP resmi berlaku.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gray-200 -translate-x-1/2 z-0" />
                )}
                <div className="relative bg-white rounded-xl border border-gray-200 p-5 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <ColorIcon icon={step.icon} color={step.color} />
                    <span className="text-xs font-mono font-semibold text-gray-400">Langkah {step.step}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROLE BENEFITS ===== */}
      <section className="py-16 md:py-20 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Dirancang untuk Setiap Peran</h3>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Setiap pengguna mendapatkan pengalaman yang disesuaikan dengan tugas dan tanggung jawabnya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {roleBenefits.map((benefit) => (
              <div
                key={benefit.role}
                className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br', benefit.gradient)}>
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{benefit.role}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
                <ul className="grid grid-cols-2 gap-2 pt-2">
                  {benefit.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center space-y-3 mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Pertanyaan Umum</h3>
            <p className="text-gray-600 text-sm">Jawaban untuk pertanyaan yang sering diajukan.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <Send className="w-10 h-10 text-blue-200 mx-auto" />
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Siap Mendigitalkan Proses SOP di Instansi Anda?
          </h3>
          <p className="text-blue-100 max-w-lg mx-auto text-sm leading-relaxed">
            Mulai gunakan platform ini untuk menyusun, mengevaluasi, dan mengesahkan SOP secara digital.
            Hubungi admin Biro Organisasi untuk pembuatan akun.
          </p>
          <Link to={ROUTES.AUTH.LOGIN}>
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-11 text-sm font-medium">
              Masuk ke Sistem
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Logo" className="w-8 h-8" />
            <span className="text-sm text-gray-600">Sistem Informasi SOP — Biro Organisasi</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
