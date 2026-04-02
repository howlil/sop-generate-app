import { HeadContent, Scripts, createRootRoute, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import appCss from '../styles.css?url'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppSkeleton } from '@/components/ui/AppSkeleton'
import { GlobalToast } from '@/components/layout/GlobalToast'
import { NotFoundPage } from '@/components/ui/not-found'
import { RouteErrorPage } from '@/components/ui/route-error'
import { RouteFocusManager } from '@/components/ui/RouteFocusManager'
import { queryClient } from '@/config/query-client'
import { getRole, useAuthStore } from '@/stores/authStore'

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
  // Use selector for setUser action (no subscription, just get the action)
  const setUser = useAuthStore((state) => state.setUser)

  // Check auth persistence on app load - synchronous check to avoid double render
  const user = useAuthStore.getState().user
  const isLoading = !user

  useEffect(() => {
    if (!user) {
      // User not logged in, nothing to check
      return
    }

    // User is logged in, no additional auth check needed
    // Token is in HttpOnly cookie (backend-managed)
  }, [user])

  // Show loading skeleton only for initial auth check
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
            <RouteFocusManager>
              {children}
            </RouteFocusManager>
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
