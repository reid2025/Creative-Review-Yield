'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Script from 'next/script'
import { toast } from 'sonner'
import { getSessionState, clearSessionState } from '@/lib/session-state-manager'

// Google configuration
const GOOGLE_CLIENT_ID = '277440481893-266hjhtdct3vmh1u3rs4cdtt9rrf6a8u.apps.googleusercontent.com'
const SPREADSHEET_ID = '1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc'
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4'
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: Record<string, unknown>) => unknown
          revoke: (token: string) => void
        }
        id: {
          initialize: (config: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
    gapi: {
      load: (api: string, callback: () => void) => void
      client: {
        init: (config: Record<string, unknown>) => Promise<void>
        load: (api: string, version: string) => Promise<void>
        request: (config: Record<string, unknown>) => Promise<any>
        getToken: () => {access_token: string} | null
        setToken: (token: {access_token: string} | null) => void
      }
      auth2?: {
        getAuthInstance: () => any
      }
    }
  }
}

interface GoogleUser {
  email: string
  name: string
  picture?: string
  access_token: string
}

interface GoogleAuthContextType {
  user: GoogleUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: () => void
  signOut: () => void
  gapiInited: boolean
  gisInited: boolean
  authError: string | null
  clearAuthError: () => void
}

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
  gapiInited: false,
  gisInited: false,
  authError: null,
  clearAuthError: () => {},
})

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenClient, setTokenClient] = useState<any>(null)
  const [gapiInited, setGapiInited] = useState(false)
  const [gisInited, setGisInited] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const clearAuthError = () => setAuthError(null)

  // Initialize Google API
  const initializeGapiClient = async () => {
    try {
      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      })
      
      await window.gapi.client.load('sheets', 'v4')
      
      // Check if there's a stored token
      const storedToken = localStorage.getItem('google_access_token')
      const storedUser = localStorage.getItem('google_user')
      
      if (storedToken && storedUser) {
        window.gapi.client.setToken({ access_token: storedToken })
        setUser(JSON.parse(storedUser))
        
        // Verify token is still valid by making a test request
        try {
          await window.gapi.client.request({
            path: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`,
            method: 'GET',
          })
          console.log('Restored session successfully')
        } catch (error) {
          console.log('Stored token expired, clearing...')
          localStorage.removeItem('google_access_token')
          localStorage.removeItem('google_user')
          setUser(null)
        }
      }
      
      setGapiInited(true)
      console.log('GAPI initialized successfully')
    } catch (error) {
      console.error('Error initializing GAPI:', error)
      toast.error('Failed to initialize Google API')
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize Google Identity Services
  const initializeGisClient = () => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response: any) => {
          console.log('Token response:', response)
          if (response.error) {
            toast.error(`Authentication failed: ${response.error}`)
            return
          }
          
          if (response.access_token) {
            // Set the token
            window.gapi.client.setToken({ access_token: response.access_token })
            
            // Get user info
            try {
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  Authorization: `Bearer ${response.access_token}`
                }
              })
              
              if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json()
                
                // Test access to the spreadsheet with retry logic
                const testSpreadsheetAccess = async (retries = 3) => {
                  // Give GAPI client a moment to be fully ready
                  await new Promise(resolve => setTimeout(resolve, 500))

                  for (let i = 0; i < retries; i++) {
                    try {
                      await window.gapi.client.request({
                        path: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`,
                        method: 'GET',
                      })

                      // User has access to the spreadsheet
                      const googleUser: GoogleUser = {
                        email: userInfo.email,
                        name: userInfo.name,
                        picture: userInfo.picture,
                        access_token: response.access_token
                      }

                      // Store in localStorage
                      localStorage.setItem('google_access_token', response.access_token)
                      localStorage.setItem('google_user', JSON.stringify(googleUser))

                      setUser(googleUser)
                      toast.success(`Welcome back, ${userInfo.name}!`)

                      // Check if there's a saved session state to restore
                      const savedState = getSessionState()

                      if (savedState && pathname === '/login') {
                        console.log('🔄 Restoring session state:', savedState)
                        toast.success('Redirecting you back to where you left off...')

                        // Clear the saved state after restoring
                        clearSessionState()

                        // Redirect to saved URL
                        router.push(savedState.url)
                      } else if (pathname === '/login') {
                        // No saved state, go to dashboard
                        router.push('/dashboard')
                      }

                      return // Success, exit function

                    } catch (error) {
                      console.log(`Spreadsheet access attempt ${i + 1} failed:`, error)
                      console.log('Error type:', typeof error)
                      console.log('Error keys:', error ? Object.keys(error) : 'null')
                      console.log('Error stringified:', JSON.stringify(error))

                      if (i === retries - 1) {
                        // Last attempt failed
                        console.error('No access to spreadsheet after retries:', error)

                        // Parse the GAPI error object more carefully
                        let errorMessage = 'Unable to verify spreadsheet access. Please try again.'

                        try {
                          // GAPI errors can have different structures
                          if (error && typeof error === 'object') {
                            const result = (error as any).result
                            const details = (error as any).details || (error as any).error
                            const status = (error as any).status || result?.error?.code

                            if (status === 403 || status === '403') {
                              errorMessage = 'You do not have access to the required spreadsheet. Please use your company email or contact your administrator.'
                            } else if (status === 401 || status === '401') {
                              errorMessage = 'Authentication failed. Please try signing in again.'
                            } else if (details || result?.error) {
                              errorMessage = 'Unable to verify spreadsheet access. Please contact support if this continues.'
                            }
                          }
                        } catch (parseError) {
                          console.log('Error parsing GAPI error:', parseError)
                          // Use default message
                        }

                        setAuthError(errorMessage)
                        toast.error(errorMessage)
                        window.gapi.client.setToken(null)
                      } else {
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000))
                      }
                    }
                  }
                }

                await testSpreadsheetAccess()
              }
            } catch (error) {
              console.error('Error getting user info:', error)
              toast.error('Failed to get user information')
            }
          }
        },
      })
      
      setTokenClient(client)
      setGisInited(true)
      console.log('GIS initialized')
    } catch (error) {
      console.error('Error initializing GIS:', error)
      toast.error('Failed to initialize Google Sign-In')
    }
  }

  // Sign in function
  const signIn = () => {
    // Clear any previous errors
    clearAuthError()

    // Check if both APIs are initialized
    if (!gapiInited || !gisInited) {
      const errorMsg = 'Authentication services are still loading. Please wait a moment and try again.'
      setAuthError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!tokenClient) {
      const errorMsg = 'Authentication not initialized'
      setAuthError(errorMsg)
      toast.error(errorMsg)
      return
    }

    try {
      (tokenClient as any).requestAccessToken()
    } catch (error) {
      console.error('Sign in error:', error)
      const errorMsg = 'Failed to sign in'
      setAuthError(errorMsg)
      toast.error(errorMsg)
    }
  }

  // Sign out function
  const signOut = () => {
    const token = window.gapi.client.getToken()
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token)
      window.gapi.client.setToken(null)
    }
    
    // Clear localStorage
    localStorage.removeItem('google_access_token')
    localStorage.removeItem('google_user')
    
    setUser(null)
    toast.success('Signed out successfully')
    router.push('/login')
  }

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, isLoading, pathname, router])

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        gapiInited,
        gisInited,
        authError,
        clearAuthError,
      }}
    >
      {/* Load Google API Scripts */}
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={() => {
          window.gapi.load('client', initializeGapiClient)
        }}
      />
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGisClient}
      />
      {children}
    </GoogleAuthContext.Provider>
  )
}

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext)
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider')
  }
  return context
}