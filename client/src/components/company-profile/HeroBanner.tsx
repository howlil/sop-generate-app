/**
 * Hero Banner - Full-width banner dengan gradient background
 * 
 * Design: Professional company profile hero dengan CTA buttons
 */
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroBanner() {
  return (
    <section className="relative h-[500px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        
        {/* Logo */}
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
          <Building2 className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Biro Organisasi
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-blue-100 max-w-2xl mb-8">
          Mengelola Standard Operating Procedure untuk Pelayanan Publik yang Lebih Baik
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            className="h-9 px-4 bg-white text-blue-600 hover:bg-blue-50 text-xs font-medium"
          >
            Layanan Kami
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 border-white/30 text-white hover:bg-white/10 text-xs font-medium"
          >
            Hubungi Kami
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
