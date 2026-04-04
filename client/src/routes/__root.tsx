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
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/features/auth/services/auth.api'

/**
 * Wait for Zustand persist to hydrate (localStorage read is async)
 */
function waitForHydration(maxWait = 1000, interval = 50): Promise<void> {
  return new Promise((resolve) => {
    let elapsed = 0
    const check = () => {
      const state = useAuthStore.getState()
      // Check if persist has finished (persistState key in localStorage)
      const hasPersisted = state.user !== null
      if (hasPersisted || elapsed >= maxWait) {
        resolve()
      } else {
        elapsed += interval
        setTimeout(check, interval)
      }
    }
    check()
  })
}

/**
 * Attempt to refresh token silently
 * Returns true if refresh succeeded
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await authApi.refresh()
    return !!response?.accessToken
  } catch {
    return false
  }
}

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    // Skip auth check for public routes
    const publicRoutes = ['/', '/auth/login']
    if (publicRoutes.some(route => location.href.startsWith(route))) {
      return
    }

    // Wait for Zustand persist to hydrate from localStorage
    // Increased timeout for reliability
    await waitForHydration(1000)

    const store = useAuthStore.getState()
    const user = store.user

    // If user exists in localStorage, verify token is still valid
    if (user) {
      const refreshed = await tryRefreshToken()
      if (!refreshed) {
        // Token expired, clear auth state and redirect
        store.logout()
        throw redirect({
          to: '/auth/login',
          search: { redirect: location.href },
        })
      }
      // Token refreshed successfully, allow access
      return
    }

    // No user in localStorage - try refresh anyway (edge case)
    const refreshed = await tryRefreshToken()
    if (!refreshed) {
      // No valid token → redirect to login
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    // Token valid but no user in store - redirect to login
    // (This shouldn't happen normally, but handle it safely)
    throw redirect({
      to: '/auth/login',
      search: { redirect: location.href },
    })
  },
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  ),
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
      // Security headers
      {
        'http-equiv': 'X-Content-Type-Options',
        content: 'nosniff',
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
  // Auth check and token refresh already handled in beforeLoad
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
