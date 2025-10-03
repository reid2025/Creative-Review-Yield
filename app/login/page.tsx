'use client'

import { useEffect } from 'react'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, LogIn, Shield, FileSpreadsheet } from 'lucide-react'

export default function LoginPage() {
  const { user, isLoading, signIn, gapiInited, gisInited, authError, clearAuthError } = useGoogleAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
          <p className="text-white">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />


      {/* Login Content */}
      <div className="z-10 relative w-full max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/assets/logo/tracker-logo-v.svg"
              alt="Creative Tracker"
              style={{ height: '5.5rem' }}
              className="w-auto"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center text-white space-y-6">
          <p className="text-white text-sm">
            Data-first creative tools for data-driven designers and analysts — made for TSEG
          </p>

          {/* Steps */}
          <div className="space-y-4 mt-8">
            {/* Step 1 */}
            <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <span className="text-black text-xs font-bold">1</span>
                </div>
              </div>
              <span className="text-white text-sm">All creatives, organized in one place</span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center space-x-3 bg-gray-600/30 rounded-lg p-4">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
              </div>
              <span className="text-white text-sm">Timeline of every asset's journey</span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center space-x-3 bg-gray-600/30 rounded-lg p-4">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
              <span className="text-white text-sm">Metrics that matter, at a glance</span>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-sm">⚠️</span>
                </div>
                <div>
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <div className="mt-8">
            <Button
              onClick={() => {
                clearAuthError()
                signIn()
              }}
              disabled={!gapiInited || !gisInited}
              className="w-full h-12 text-sm bg-white text-black border-0 rounded-lg font-medium"
              style={{
                '--hover-bg': '#cdcdcd'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cdcdcd'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {(!gapiInited || !gisInited) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}