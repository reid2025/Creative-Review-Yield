'use client'

import { useEffect } from 'react'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, LogIn, Shield, FileSpreadsheet } from 'lucide-react'

export default function LoginPage() {
  const { user, isLoading, signIn, gapiInited, gisInited } = useGoogleAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Creative Review Yield
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your Google account to access the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Secure Authentication</AlertTitle>
            <AlertDescription className="text-blue-700">
              • Only authorized Google accounts can access this application<br/>
              • You must have access to the company spreadsheet<br/>
              • Your session will be saved securely
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={signIn}
              disabled={!gapiInited || !gisInited}
              className="w-full h-12 text-base"
              size="lg"
            >
              {(!gapiInited || !gisInited) ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By signing in, you agree to access company data responsibly and maintain confidentiality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}