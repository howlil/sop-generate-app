/**
 * Route Focus Manager
 * Handles focus management for accessibility on route changes.
 * WCAG 2.2 AA compliant.
 */

import { useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'

/**
 * Route Focus Manager Component
 * Wraps content and manages focus on route changes.
 */
export function RouteFocusManager({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPathRef = useRef<string>(location.pathname)

  useEffect(() => {
    const currentPath = location.pathname
    const previousPath = previousPathRef.current

    if (currentPath !== previousPath) {
      const announcement = `Navigated to ${currentPath}`

      requestAnimationFrame(() => {
        mainRef.current?.focus()
      })

      const liveRegion = document.getElementById('route-announcer')
      if (liveRegion) {
        liveRegion.textContent = announcement
      }

      previousPathRef.current = currentPath
    }
  }, [location.pathname])

  return (
    <>
      <div
        id="route-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <main
        ref={mainRef}
        tabIndex={-1}
        className="outline-none"
        data-testid="main-content"
      >
        {children}
      </main>
    </>
  )
}
