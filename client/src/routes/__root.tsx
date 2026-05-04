import {
  HeadContent,
  Scripts,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import appCss from "../styles.css?url";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { GlobalToast } from "@/components/layout/GlobalToast";
import { NotFoundPage } from "@/components/ui/not-found";
import { RouteErrorPage } from "@/components/ui/route-error";
import { RouteFocusManager } from "@/components/ui/route-focus-manager";
import { queryClient } from "@/config/query-client";
import { useAuthStore, ensureAuthHydrated, syncAuthFromCookie } from "@/stores/authStore";
import { ROUTES } from "@/utils/constants";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const isPublic =
      location.pathname === ROUTES.HOME || location.pathname.startsWith(ROUTES.AUTH.LOGIN);
    if (isPublic) return;

    /** Lewati guard di SSR: persist & sesi JS hanya di browser (sama seperti requireRoles). */
    const isServerSide =
      import.meta.env.SSR === true ||
      typeof globalThis.window === "undefined" ||
      typeof globalThis.document === "undefined";
    if (isServerSide) {
      return;
    }

    await ensureAuthHydrated();

    let store = useAuthStore.getState();
    if (!store.user) {
      await syncAuthFromCookie();
      store = useAuthStore.getState();
    }

    if (!store.user) {
      throw redirect({
        to: ROUTES.AUTH.LOGIN,
        search: { redirect: location.href },
      });
    }
  },
  pendingMs: 1000,
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  ),
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorPage error={error} reset={reset} />
  ),
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Sistem Informasi SOP",
      },
      // Security headers
      {
        httpEquiv: "X-Content-Type-Options",
        content: "nosniff",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  // Auth check and token refresh already handled in beforeLoad
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        <ErrorBoundary
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
                <p className="text-gray-600 mb-4">Mohon maaf, terjadi kesalahan pada sistem.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Muat Ulang Halaman
                </button>
              </div>
            </div>
          }
        >
          <QueryClientProvider client={queryClient}>
            <RouteFocusManager>{children}</RouteFocusManager>
            <GlobalToast />
            {import.meta.env.DEV && (
              <>
                <TanStackDevtools
                  config={{
                    position: "bottom-right",
                  }}
                  plugins={[
                    {
                      name: "Tanstack Router",
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
  );
}
