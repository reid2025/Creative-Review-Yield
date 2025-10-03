'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { toast } from 'sonner'
import { saveSessionState } from '@/lib/session-state-manager'

/**
 * Hook to monitor Google OAuth session expiration
 * Google OAuth tokens typically expire after 1 hour (3600 seconds)
 */
export function useSessionMonitor() {
  const { user, signIn } = useGoogleAuth()
  const [showExpirationModal, setShowExpirationModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null)

  /**
   * Check if token is expired or about to expire
   */
  const checkTokenExpiry = useCallback(() => {
    if (!user) return

    const token = localStorage.getItem('google_access_token')
    if (!token) {
      console.log('🔴 No token found in localStorage')
      return
    }

    // Try to get token expiry from gapi
    try {
      const gapiToken = window.gapi?.client?.getToken()
      if (gapiToken) {
        // Google tokens typically expire in 1 hour (3600 seconds)
        // We'll estimate expiry time if not provided
        const now = Date.now()

        // If we don't have an expiry time stored, estimate it (1 hour from now)
        if (!tokenExpiryTime) {
          const estimatedExpiry = now + (3600 * 1000) // 1 hour from now
          setTokenExpiryTime(estimatedExpiry)
          console.log('⏰ Estimated token expiry:', new Date(estimatedExpiry).toLocaleString())
          return
        }

        const timeUntilExpiry = tokenExpiryTime - now
        const fiveMinutes = 5 * 60 * 1000

        console.log('⏰ Time until expiry:', Math.floor(timeUntilExpiry / 1000), 'seconds')

        // Show warning 5 minutes before expiry
        if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0 && !showWarningModal) {
          console.log('⚠️ Session expiring soon!')
          setShowWarningModal(true)

          // Show toast warning
          toast.warning('Your session will expire soon. Please refresh to continue.', {
            duration: 300000, // 5 minutes
            id: 'session-warning',
            action: {
              label: 'Refresh',
              onClick: () => {
                toast.dismiss('session-warning')
                signIn()
              }
            }
          })
        }

        // Token expired
        if (timeUntilExpiry <= 0) {
          console.log('🔴 Token expired!')
          handleSessionExpired()
        }
      }
    } catch (error) {
      console.error('Error checking token expiry:', error)
    }
  }, [user, tokenExpiryTime, showWarningModal, signIn])

  /**
   * Handle session expiration
   */
  const handleSessionExpired = useCallback(() => {
    console.log('💾 Saving session state before logout...')

    // Save current page state
    saveSessionState({
      url: window.location.pathname + window.location.search
    })

    // Clear token
    localStorage.removeItem('google_access_token')
    localStorage.removeItem('google_user')

    // Show expiration modal
    setShowExpirationModal(true)
  }, [])

  /**
   * Test token validity by making a test API call
   */
  const testTokenValidity = useCallback(async () => {
    if (!user) return

    try {
      const SPREADSHEET_ID = '1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc'

      await window.gapi.client.request({
        path: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`,
        method: 'GET',
      })

      console.log('✅ Token is valid')
    } catch (error: any) {
      console.log('🔴 Token validation failed:', error)

      // Check if it's an authentication error
      if (error?.status === 401 || error?.status === 403) {
        console.log('🔴 Authentication error detected!')
        handleSessionExpired()
      }
    }
  }, [user, handleSessionExpired])

  /**
   * Set up periodic monitoring
   */
  useEffect(() => {
    if (!user) return

    // Initial token validity check
    testTokenValidity()

    // Check token expiry every minute
    const expiryInterval = setInterval(checkTokenExpiry, 60 * 1000)

    // Test token validity every 5 minutes
    const validityInterval = setInterval(testTokenValidity, 5 * 60 * 1000)

    return () => {
      clearInterval(expiryInterval)
      clearInterval(validityInterval)
    }
  }, [user, checkTokenExpiry, testTokenValidity])

  /**
   * Listen for API errors globally
   */
  useEffect(() => {
    if (!user) return

    const handleGapiError = (event: any) => {
      const error = event.detail || event

      if (error?.status === 401 || error?.status === 403) {
        console.log('🔴 GAPI error detected:', error)
        handleSessionExpired()
      }
    }

    window.addEventListener('gapi.error', handleGapiError)

    return () => {
      window.removeEventListener('gapi.error', handleGapiError)
    }
  }, [user, handleSessionExpired])

  return {
    showExpirationModal,
    showWarningModal,
    setShowExpirationModal,
    handleRefreshSession: () => {
      toast.dismiss('session-warning')
      setShowWarningModal(false)
      signIn()
    }
  }
}
