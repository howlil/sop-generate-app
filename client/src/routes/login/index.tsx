import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { LoginPage } from '@/pages/login/LoginPage'
import { RouteErrorPage } from '@/components/ui/route-error'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login/')({
  validateSearch: zodSearchValidator(loginSearchSchema),
  component: LoginPage,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})