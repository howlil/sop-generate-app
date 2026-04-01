import { createFileRoute } from '@tanstack/react-router'
import { CompanyProfile } from '@/pages/CompanyProfile'

export const Route = createFileRoute('/')({
  component: CompanyProfile,
})
