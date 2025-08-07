'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export function UserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push('/login')}>
          Sign In
        </Button>
        <Button onClick={() => router.push('/register')}>
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span className="text-sm">
          {user.displayName || user.email}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}