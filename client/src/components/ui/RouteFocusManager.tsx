/**
 * Route Focus Manager
 * Handles focus management for accessibility on route changes
 * WCAG 2.2 AA compliant
 */

import { useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'

/**
 * Get human-readable route name from pathname
 */
function getRouteName(pathname: string): string {
  const routeNames: Record<string, string> = {
    '/': 'Home',
    '/auth/login': 'Login',
    '/biro-organisasi': 'Biro Organisasi',
    '/tim-penyusun': 'Tim Penyusun',
    '/kepala-opd': 'Kepala OPD',
    '/tim-evaluasi': 'Tim Evaluasi',
  }

  // Check exact match first
  if (routeNames[pathname]) {
    return routeNames[pathname]
  }

  // Check prefix match
  for (const [prefix, name] of Object.entries(routeNames)) {
    if (pathname.startsWith(prefix)) {
      return name
    }
  }

  return 'Page'
}

/**
 * Route Focus Manager Component
 * Wraps content and manages focus on route changes
 */
export function RouteFocusManager({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPathRef = useRef<string>(location.pathname)

  useEffect(() => {
    const currentPath = location.pathname
    const previousPath = previousPathRef.current

    // Only announce if path actually changed
    if (currentPath !== previousPath) {
      const routeName = getRouteName(currentPath)
      const announcement = `Navigated to ${routeName}`

      // Set focus to main content for keyboard users
      requestAnimationFrame(() => {
        mainRef.current?.focus()
      })

      // Announce to screen readers
      const liveRegion = document.getElementById('route-announcer')
      if (liveRegion) {
        liveRegion.textContent = announcement
      }

      previousPathRef.current = currentPath
    }
  }, [location.pathname])

  return (
    <>
      {/* Screen reader announcer */}
      <div
        id="route-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        }}
      />

      {/* Main content with focus management */}
      <main
        ref={mainRef}
        tabIndex={-1}
        style={{ outline: 'none' }}
        data-testid="main-content"
      >
        {children}
      </main>
    </>
  )
}
