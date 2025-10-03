'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SessionExpirationModalProps {
  isOpen: boolean
  onLoginAgain: () => void
  showWarning?: boolean
}

export function SessionExpirationModal({
  isOpen,
  onLoginAgain,
  showWarning = false
}: SessionExpirationModalProps) {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    if (showWarning && isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [showWarning, isOpen, countdown])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        style={{ zIndex: 100 }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-[101] p-4"
        style={{ zIndex: 101 }}
      >
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-black" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-league-spartan text-2xl font-bold text-center text-gray-900 mb-2">
            {showWarning ? 'Session Expiring Soon' : 'Session Expired'}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 mb-6">
            {showWarning ? (
              <>
                Your session will expire in <span className="font-semibold text-black">{countdown} seconds</span>.
                <br />
                Please refresh your session to continue working.
              </>
            ) : (
              <>
                Your session has expired for security reasons.
                <br />
                <span className="text-gray-900 font-medium">Don't worry - your work has been saved!</span>
              </>
            )}
          </p>

          {/* Button */}
          <Button
            onClick={onLoginAgain}
            className="w-full bg-black text-white hover:bg-gray-800"
            size="lg"
          >
            {showWarning ? 'Refresh Session' : 'Log In Again'}
          </Button>

          {/* Additional info */}
          {!showWarning && (
            <p className="text-xs text-gray-500 text-center mt-4">
              You'll be redirected back to where you left off after logging in.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

// Warning Toast Component
export function SessionWarningToast({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 min-w-[320px]">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-sm">Session expiring soon</p>
          <p className="text-xs text-gray-600">Please refresh to continue</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        Refresh
      </Button>
    </div>
  )
}
