/**
 * Company Profile Landing Page
 * 
 * Halaman company profile Biro Organisasi dengan sections:
 * - Hero Banner
 * - About Us
 * - Vision & Mission
 * - Services
 * - Contact
 * - Footer
 */
import { HeroBanner } from '@/components/company-profile/HeroBanner'
import { AboutSection } from '@/components/company-profile/AboutSection'
import { VisionMission } from '@/components/company-profile/VisionMission'
import { ServicesSection } from '@/components/company-profile/ServicesSection'
import { ContactSection } from '@/components/company-profile/ContactSection'
import { CompanyFooter } from '@/components/company-profile/CompanyFooter'

export function CompanyProfile() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content */}
      <main>
        {/* About Section */}
        <AboutSection />

        {/* Vision & Mission */}
        <VisionMission />

        {/* Services */}
        <ServicesSection />

        {/* Contact */}
        <ContactSection />
      </main>

      {/* Footer */}
      <CompanyFooter />
    </div>
  )
}
