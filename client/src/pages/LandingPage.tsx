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
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'
import logoSvg from '@/assets/logo.svg'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import {
  FileText,
  CheckCircle,
  ArrowRight,
  Clock,
  Search,
  PenTool,
  Send,
  Award,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/utils/cn'

// ==================== DATA ====================

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
    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', colorMap[color] || colorMap.blue)}>
      <Icon className="w-5 h-5" />
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* ===== HEADER ===== */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent border-0'
      )}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Logo" className="w-9 h-9" />
            <div className="hidden sm:block">
              <h1 className={cn('text-sm font-semibold leading-tight transition-colors', scrolled ? 'text-gray-900' : 'text-white')}>Sistem Informasi SOP</h1>
              <p className={cn('text-[11px] leading-tight transition-colors', scrolled ? 'text-gray-500' : 'text-blue-200')}>Biro Organisasi</p>
            </div>
          </div>
          <Link to={ROUTES.AUTH.LOGIN}>
            <button className={cn(
              'h-8 px-4 text-xs font-medium rounded-full transition-all flex items-center gap-1.5',
              scrolled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-white/40 text-white hover:bg-white/10 bg-transparent'
            )}>
              Masuk
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section
        className="relative w-full h-screen bg-no-repeat bg-cover bg-center text-sm flex flex-col justify-start pt-32 md:pt-40"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

        <div className="relative flex items-center gap-2 border border-white/30 hover:border-white/50 rounded-full w-max mx-auto px-4 py-2 mt-0 md:mt-0 bg-white/10 backdrop-blur-sm">
          <Clock className="w-4 h-4 text-white" />
          <span className="font-medium text-white">Platform Digital Terintegrasi</span>
          <span className="text-white/60">—</span>
          <a href="#cara-kerja" className="flex items-center gap-1 font-medium text-white hover:text-blue-100">
            <span>Pelajari lebih lanjut</span>
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3.959 9.5h11.083m0 0L9.501 3.958M15.042 9.5l-5.541 5.54" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <h5 className="relative text-4xl md:text-7xl font-medium max-w-[850px] text-center mx-auto mt-8 text-white">
          Kelola SOP Lebih Cepat, Transparan, dan Terukur
        </h5>

        <p className="relative text-sm md:text-base mx-auto max-w-2xl text-center mt-6 text-gray-300 max-md:px-2">
          Dari penyusunan hingga pengesahan — seluruh proses SOP terdigitalisasi dengan jejak audit yang lengkap.
          Tidak ada lagi dokumen hilang, versi membingungkan, atau proses yang tidak terlacak.
        </p>

        <div className="relative mx-auto w-full flex items-center justify-center gap-3 mt-4">
          <Link to={ROUTES.AUTH.LOGIN}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition">
              Mulai Sekarang
            </button>
          </Link>
          <a href="#cara-kerja">
            <button className="flex items-center gap-2 border border-white/40 hover:bg-white/10 rounded-full px-6 py-3 text-white">
              <span>Lihat Cara Kerja</span>
              <svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M1.25.5 4.75 4l-3.5 3.5" stroke="white" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </a>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="cara-kerja" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h3 className="text-2xl md:text-3xl font-medium text-gray-900">Cara Kerja</h3>
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
                <div className="relative bg-white rounded-2xl border border-gray-200 p-6 space-y-4 hover:shadow-md hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-3">
                    <ColorIcon icon={step.icon} color={step.color} />
                    <span className="text-xs font-mono font-semibold text-gray-400">Langkah {step.step}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROLE BENEFITS ===== */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h3 className="text-2xl md:text-3xl font-medium text-gray-900">Dirancang untuk Setiap Peran</h3>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Setiap pengguna mendapatkan pengalaman yang disesuaikan dengan tugas dan tanggung jawabnya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {roleBenefits.map((benefit) => (
              <div
                key={benefit.role}
                className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br', benefit.gradient)}>
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{benefit.role}</h4>
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
            <h3 className="text-2xl md:text-3xl font-medium text-gray-900">Pertanyaan Umum</h3>
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
          <h3 className="text-2xl md:text-3xl font-medium text-white">
            Siap Mendigitalkan Proses SOP di Instansi Anda?
          </h3>
          <p className="text-blue-100 max-w-lg mx-auto text-sm leading-relaxed">
            Mulai gunakan platform ini untuk menyusun, mengevaluasi, dan mengesahkan SOP secara digital.
            Hubungi admin Biro Organisasi untuk pembuatan akun.
          </p>
          <Link to={ROUTES.AUTH.LOGIN}>
            <button className="bg-white text-blue-700 hover:bg-blue-50 h-11 px-6 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all">
              Masuk ke Sistem
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 bg-white relative z-10">
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
