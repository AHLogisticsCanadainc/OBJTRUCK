/**
 * DEPRECATED: This file is kept for backward compatibility only.
 * All token handling is now done directly through Supabase's session management.
 */

// Export empty functions to satisfy any remaining imports
export const getAccessToken = () => null
export const getRefreshToken = () => null
export const getTokenExpirationTime = () => null
export const hasValidAuthData = () => true
export const verifyTokenAccessibility = () => ({ tokenFound: true, tokenValid: true })
export const getExactExpirationTime = () => null
