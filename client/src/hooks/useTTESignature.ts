/**
 * Stub hook for TTE signature - will be replaced by API calls
 * @deprecated Use TTE API directly
 */

export function useTTESignature(params: any) {
  return {
    signature: null,
    loading: false,
    error: null,
    loadSignature: async () => {},
    sign: async (data: any) => {
      console.warn('useTTESignature.sign is deprecated - use API instead')
      return null
    },
  }
}
