/**
 * Error Boundary - Catch React errors and show fallback UI
 * 
 * Features:
 * - Catches JavaScript errors in child components
 * - Shows user-friendly error message
 * - Provides retry action
 * - Logs errors for debugging
 */

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  private handleGoBack = () => {
    window.history.back()
  }

  public render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 space-y-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                Terjadi Kesalahan
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Maaf, terjadi kesalahan tak terduga pada sistem.
              </p>
              {error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Detail error (untuk developer)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-red-600 overflow-auto">
                    {error.toString()}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={this.handleGoBack}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Muat Ulang
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Jika masalah berlanjut, hubungi admin sistem.
            </p>
          </div>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
