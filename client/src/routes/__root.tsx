import { HeadContent, Scripts, createRootRoute, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import appCss from '../styles.css?url'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppSkeleton } from '@/components/ui/AppSkeleton'
import { GlobalToast } from '@/components/layout/GlobalToast'
import { NotFoundPage } from '@/components/ui/not-found'
import { RouteErrorPage } from '@/components/ui/route-error'
import { queryClient } from '@/services/queryClient'
import { getRole, useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/auth.api'

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    // Skip auth check for public routes
    const publicRoutes = ['/', '/auth/login']
    if (publicRoutes.some(route => location.href.startsWith(route))) {
      return
    }

    const user = getRole()
    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }
  },
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Sistem Informasi SOP',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { setToken, setUser } = useAuthStore()

  // Check auth persistence on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authApi.getToken()
        if (token) {
          // Token exists, set it in store
          // User info should already be in localStorage from previous login
          const user = useAuthStore.getState().user
          if (user) {
            setToken(token)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        // Always finish loading, even if auth check fails
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [setToken])

  // Show loading skeleton during initial auth check
  if (isLoading) {
    return (
      <html lang="id">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Sistem Informasi SOP</title>
          <link rel="stylesheet" href={appCss} />
        </head>
        <body>
          <AppSkeleton />
          <Scripts />
        </body>
      </html>
    )
  }

  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            {children}
            <GlobalToast />
            {import.meta.env.DEV && (
              <>
                <TanStackDevtools
                  config={{
                    position: 'bottom-right',
                  }}
                  plugins={[
                    {
                      name: 'Tanstack Router',
                      render: <TanStackRouterDevtoolsPanel />,
                    },
                  ]}
                />
                <ReactQueryDevtools initialIsOpen={false} />
              </>
            )}
            <Scripts />
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
