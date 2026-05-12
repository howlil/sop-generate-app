/**
 * Landing Page — Sistem Informasi SOP PJ Evaluator Organisasi
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
  Shield,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/card'

// ==================== DATA ====================

const workflowSteps = [
  {
    step: '01',
    title: 'Susun',
    description: 'Penyusun membuat SOP dengan editor prosedur berbasis swimlane yang intuitif.',
    icon: PenTool,
    color: 'blue',
  },
  {
    step: '02',
    title: 'Evaluasi',
    description: 'Evaluator menilai kesesuaian SOP terhadap standar yang berlaku secara terstruktur.',
    icon: Search,
    color: 'amber',
  },
  {
    step: '03',
    title: 'Verifikasi',
    description: 'PJ Evaluator Organisasi memverifikasi hasil evaluasi dan memastikan kualitas SOP.',
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
    role: 'Penyusun',
    description: 'Fokus pada substansi, bukan administrasi. Editor prosedur visual membuat penyusunan SOP jadi lebih mudah.',
    features: ['Editor prosedur drag-and-drop', 'Preview SOP real-time', 'Template siap pakai', 'Kolaborasi tim'],
    icon: FileText,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    role: 'Evaluator',
    description: 'Penilaian terstruktur dengan rubrik yang jelas. Tidak ada lagi evaluasi yang subjektif atau tidak konsisten.',
    features: ['Rubrik evaluasi standar', 'Dashboard tugas', 'Riwayat penilaian', 'Catatan terstruktur'],
    icon: Search,
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    role: 'PJ Evaluator Organisasi',
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
    answer: 'Sistem ini dirancang untuk 5 peran: Penyusun, PJ Penyusun, Evaluator, PJ Evaluator Organisasi, dan Kepala OPD. Setiap peran memiliki dashboard dan fitur yang disesuaikan.',
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

function RoleTabs() {
  const [active, setActive] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const tabs = [
    { label: 'Penyusun', icon: FileText },
    { label: 'Evaluator', icon: Search },
    { label: 'PJ Evaluator Organisasi', icon: CheckCircle },
    { label: 'Kepala OPD', icon: Award },
  ]

  const themes = [
    { accent: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-500/20', glow: 'shadow-blue-500/10' },
    { accent: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-500/20', glow: 'shadow-amber-500/10' },
    { accent: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500/20', glow: 'shadow-green-500/10' },
    { accent: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200', ring: 'ring-purple-500/20', glow: 'shadow-purple-500/10' },
  ]

  const handleTabClick = (index: number) => {
    if (index === active || isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActive(index)
      setIsTransitioning(false)
    }, 200)
  }

  return (
    <div className="relative">
      {/* Tab bar */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => handleTabClick(i)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                active === i
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card display */}
      <div className="relative" style={{ minHeight: '480px' }}>
        {[0, 1, 2, 3].map((i) => {
          const t = themes[i]
          const isActive = active === i
          return (
            <div
              key={tabs[i].label}
              className={cn(
                'absolute inset-0 transition-all duration-500 ease-out',
                isActive
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-[0.98] pointer-events-none'
              )}
              style={{ transitionDuration: isTransitioning ? '200ms' : '500ms' }}
            >
              <div className={cn(
                'h-full rounded-3xl border-2 p-8 flex flex-col transition-all duration-500',
                isActive ? cn('bg-white', t.border, 'shadow-xl', t.glow) : 'bg-gray-50 border-gray-100'
              )}>
                {/* Top accent line */}
                <div className={cn('h-1 rounded-full mb-6', t.accent)} style={{ width: '48px' }} />

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', t.accent)}>
                    {(() => { const Icon = tabs[i].icon; return <Icon className="w-6 h-6 text-white" /> })()}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-medium text-gray-900 mb-1">{tabs[i].label}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{roleBenefits[i].description}</p>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {roleBenefits[i].features.map((f) => (
                    <span key={f} className={cn('text-xs px-3 py-1.5 rounded-full font-medium', t.light, t.text)}>
                      {f}
                    </span>
                  ))}
                </div>

                {/* Preview */}
                <div className="flex-1">
                  <div className={cn('rounded-2xl border p-5 h-full', t.light)}>
                    <RolePreview roleIndex={i} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RolePreview({ roleIndex }: { roleIndex: number }) {
  if (roleIndex === 0) {
    return (
      <div className="space-y-1.5">
        {['Pelayanan · Draft', 'Evaluasi · Review', 'Verifikasi · Final'].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-white rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className={cn('w-3.5 h-3.5 shrink-0', i === 0 ? 'text-blue-500' : i === 1 ? 'text-amber-500' : 'text-green-500')} />
              <span className="text-[11px] text-gray-600 truncate">SOP {item.split(' · ')[0]}</span>
            </div>
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0',
              i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            )}>{item.split(' · ')[1]}</span>
          </div>
        ))}
      </div>
    )
  }
  if (roleIndex === 1) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {[{ label: 'Disetujui', value: '12', color: 'green' }, { label: 'Revisi', value: '3', color: 'amber' }, { label: 'Skor', value: '87%', color: 'blue' }].map((s) => (
            <div key={s.label} className={cn('rounded-lg border p-2.5 text-center', s.color === 'green' ? 'bg-green-50 border-green-100' : s.color === 'amber' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100')}>
              <div className={cn('text-lg font-medium', s.color === 'green' ? 'text-green-700' : s.color === 'amber' ? 'text-amber-700' : 'text-blue-700')}>{s.value}</div>
              <div className={cn('text-[9px]', s.color === 'green' ? 'text-green-600' : s.color === 'amber' ? 'text-amber-600' : 'text-blue-600')}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border p-3 space-y-2">
          {[{ name: 'Kelengkapan', pct: 92 }, { name: 'Kesesuaian', pct: 78 }].map((r) => (
            <div key={r.name}>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>{r.name}</span><span className="font-medium">{r.pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', r.pct >= 90 ? 'bg-green-500' : 'bg-amber-500')} style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (roleIndex === 2) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-end gap-1.5 h-14 mb-2">
            {[40, 55, 45, 70, 55, 80, 65, 90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-green-500" style={{ height: `${h}%`, opacity: 0.4 + (h / 100) * 0.6 }} />
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-gray-400">
            <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{ l: 'Total', v: '24', c: 'text-gray-900' }, { l: 'Selesai', v: '18', c: 'text-green-600' }, { l: 'Revisi', v: '6', c: 'text-amber-600' }].map((s) => (
            <div key={s.l} className="bg-white rounded-lg border p-2 text-center">
              <div className={cn('text-lg font-medium', s.c)}>{s.v}</div>
              <div className="text-[8px] text-gray-400">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      {['Manajemen Risiko', 'Pengadaan Barang', 'Kepegawaian'].map((name, i) => (
        <div key={name} className="flex items-center justify-between bg-white rounded-lg border px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[8px] font-medium',
              i === 0 ? 'bg-red-100 text-red-600' : i === 1 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
            )}>{['KR', 'PB', 'KP'][i]}</div>
            <span className="text-[11px] text-gray-600 truncate">{name}</span>
          </div>
          <div className={cn('w-2 h-2 rounded-full shrink-0', i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-green-500')} />
        </div>
      ))}
      <div className="bg-purple-600 rounded-lg p-2.5 text-center mt-2">
        <span className="text-[10px] text-white font-medium">Tanda Tangan Elektronik →</span>
      </div>
    </div>
  )
}

// ==================== PAGE ====================

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  /* Langganan scroll window: bukan data fetching (selaras react-skil §3). */
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
              <p className={cn('text-[11px] leading-tight transition-colors', scrolled ? 'text-gray-500' : 'text-blue-200')}>PJ Evaluator Organisasi</p>
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
      <section id="cara-kerja" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h3 className="text-2xl md:text-3xl font-medium text-gray-900">Cara Kerja</h3>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Empat langkah terstruktur dari penyusunan hingga SOP resmi berlaku.
            </p>
          </div>

          <div className="mx-auto grid gap-4 sm:grid-cols-5">
            {/* Card 01 - Susun (spans 3 cols) */}
            <Card className="group overflow-hidden border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-blue-900/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl">
              <div className="relative p-6 md:p-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                    <PenTool className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">Langkah 01</span>
                    <h4 className="text-lg font-medium text-gray-900 mt-2 mb-1">{workflowSteps[0].title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-md">{workflowSteps[0].description}</p>
                  </div>
                </div>
                {/* High-level mock UI */}
                <div className="relative mt-6 bg-white rounded-xl border overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-gray-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-100" />
                    <span className="text-[10px] text-gray-400 ml-2">Swimlane Editor</span>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded w-16" />
                      <div className="h-16 bg-gray-50 rounded border" />
                      <div className="h-2 bg-gray-100 rounded w-12" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded w-14" />
                      <div className="h-12 bg-gray-50 rounded border" />
                      <div className="h-8 bg-gray-100/50 rounded" />
                      <div className="h-2 bg-gray-100 rounded w-10" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded w-16" />
                      <div className="h-14 bg-gray-50 rounded border" />
                      <div className="h-2 bg-gray-100 rounded w-12" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 02 - Evaluasi (spans 2 cols) */}
            <Card className="group overflow-hidden border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-amber-900/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
              <div className="flex flex-col h-full p-6 md:p-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">Langkah 02</span>
                      <h4 className="text-lg font-medium text-gray-900 mt-1">{workflowSteps[1].title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{workflowSteps[1].description}</p>
                </div>
                {/* High-level mock UI */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 bg-white rounded-lg border p-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <div className="h-1.5 bg-gray-200 rounded flex-1" />
                    <div className="h-4 w-8 bg-green-100 rounded text-[9px] text-green-700 flex items-center justify-center font-medium">Pass</div>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg border p-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="h-1.5 bg-gray-200 rounded flex-1" />
                    <div className="h-4 w-10 bg-amber-100 rounded text-[9px] text-amber-700 flex items-center justify-center font-medium">Review</div>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg border p-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <div className="h-1.5 bg-gray-200 rounded flex-1" />
                    <div className="h-4 w-8 bg-green-100 rounded text-[9px] text-green-700 flex items-center justify-center font-medium">Pass</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 03 - Verifikasi (spans 2 cols) */}
            <Card className="group overflow-hidden border-green-200/60 bg-gradient-to-br from-green-50 to-green-100/50 shadow-green-900/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl">
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-600/20">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">Langkah 03</span>
                    <h4 className="text-lg font-medium text-gray-900 mt-2 mb-1">{workflowSteps[2].title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{workflowSteps[2].description}</p>
                  </div>
                </div>
                {/* High-level mock UI */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg border p-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>Format SOP sesuai standar</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg border p-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>Evaluasi telah lengkap</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 04 - Sahkan (spans 3 cols) */}
            <Card className="group overflow-hidden border-purple-200/60 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-purple-900/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl">
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">Langkah 04</span>
                    <h4 className="text-lg font-medium text-gray-900 mt-2 mb-1">{workflowSteps[3].title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-md">{workflowSteps[3].description}</p>
                  </div>
                </div>
                {/* High-level mock UI */}
                <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <div className="aspect-square rounded-lg border-2 border-dashed" />
                  <div className="aspect-square rounded-lg bg-purple-100 border flex items-center justify-center">
                    <span className="text-[10px] font-medium text-purple-600">TTE</span>
                  </div>
                  <div className="aspect-square rounded-lg border-2 border-dashed" />
                  <div className="aspect-square rounded-lg bg-purple-100 border flex items-center justify-center">
                    <span className="text-[10px] font-medium text-purple-600">PIN</span>
                  </div>
                  <div className="aspect-square rounded-lg border-2 border-dashed" />
                  <div className="aspect-square rounded-lg bg-purple-100 border flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== ROLE BENEFITS ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h3 className="text-2xl md:text-3xl font-medium text-gray-900">Dirancang untuk Setiap Peran</h3>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Setiap pengguna mendapatkan pengalaman yang disesuaikan dengan tugas dan tanggung jawabnya.
            </p>
          </div>

          <RoleTabs />
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
            Hubungi admin PJ Evaluator Organisasi untuk pembuatan akun.
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
            <span className="text-sm text-gray-600">Sistem Informasi SOP — PJ Evaluator Organisasi</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
