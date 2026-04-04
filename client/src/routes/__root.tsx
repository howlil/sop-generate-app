import { HeadContent, Scripts, createRootRoute, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import appCss from '../styles.css?url'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { GlobalToast } from '@/components/layout/GlobalToast'
import { NotFoundPage } from '@/components/ui/not-found'
import { RouteErrorPage } from '@/components/ui/route-error'
import { RouteFocusManager } from '@/components/ui/RouteFocusManager'
import { queryClient } from '@/config/query-client'
import { getRole } from '@/stores/authStore'

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
  // Auth check is synchronous (Zustand persist reads localStorage)
  // No need for loading skeleton — beforeLoad handles redirects
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
