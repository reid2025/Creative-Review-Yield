'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { UserMenu } from '@/components/UserMenu'

export default function AuthTestPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
            <CardDescription>
              This page shows your current authentication status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Auth Status:</h3>
                {loading ? (
                  <p>Loading...</p>
                ) : user ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-semibold">✅ Authenticated</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Username:</strong> {user.displayName || 'Not set'}</p>
                    <p><strong>User ID:</strong> {user.uid}</p>
                  </div>
                ) : (
                  <p className="text-red-600 font-semibold">❌ Not authenticated</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => router.push('/login')}>
                  Go to Login
                </Button>
                <Button onClick={() => router.push('/register')}>
                  Go to Register
                </Button>
                <Button onClick={() => router.push('/upload/single')}>
                  Go to Upload
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">User Menu Component:</h3>
                <UserMenu />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
              {JSON.stringify({
                isLoading: loading,
                isAuthenticated: !!user,
                userEmail: user?.email || null,
                userDisplayName: user?.displayName || null,
                userId: user?.uid || null,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}