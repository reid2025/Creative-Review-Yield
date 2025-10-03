'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionExpirationModal } from '@/components/SessionExpirationModal'
import { toast } from 'sonner'
import { AlertCircle, TestTube } from 'lucide-react'

export default function SessionTestPage() {
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [showExpiredModal, setShowExpiredModal] = useState(false)

  const handleShowWarningToast = () => {
    toast.warning('Your session will expire soon. Please refresh to continue.', {
      duration: 10000, // 10 seconds for testing
      id: 'session-warning-test',
      action: {
        label: 'Refresh',
        onClick: () => {
          toast.dismiss('session-warning-test')
          toast.success('Refresh button clicked!')
        }
      }
    })
  }

  const handleShowWarningModal = () => {
    setShowWarningModal(true)
  }

  const handleShowExpiredModal = () => {
    setShowExpiredModal(true)
  }

  const handleCloseModals = () => {
    setShowWarningModal(false)
    setShowExpiredModal(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TestTube className="h-8 w-8 text-blue-600" />
          <h1 className="font-league-spartan text-3xl font-bold">Session Test Page</h1>
        </div>
        <p className="text-gray-600">
          Test the session expiration warning toast and modals without waiting for actual expiration
        </p>
      </div>

      {/* Test Controls */}
      <div className="grid gap-6">
        {/* Warning Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="font-league-spartan text-lg font-semibold">1. Warning Toast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This toast appears <strong>5 minutes before</strong> session expiration.
              <br />
              Features a "Refresh" button to re-authenticate.
            </p>
            <Button onClick={handleShowWarningToast} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Show Warning Toast
            </Button>
          </CardContent>
        </Card>

        {/* Warning Modal */}
        <Card>
          <CardHeader>
            <CardTitle className="font-league-spartan text-lg font-semibold">2. Warning Modal (with countdown)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Alternative warning display as a full-screen modal.
              <br />
              Shows countdown and prompts user to refresh session.
            </p>
            <Button onClick={handleShowWarningModal} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Show Warning Modal
            </Button>
          </CardContent>
        </Card>

        {/* Expired Modal */}
        <Card>
          <CardHeader>
            <CardTitle className="font-league-spartan text-lg font-semibold">3. Session Expired Modal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This modal appears when the session has <strong>fully expired</strong>.
              <br />
              Reassures user that their work is saved and prompts re-login.
            </p>
            <Button onClick={handleShowExpiredModal}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Show Expired Modal
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How it works in production:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>System checks token expiry every minute</li>
                  <li>Warning toast appears 5 minutes before expiration</li>
                  <li>If ignored, full modal appears when session expires</li>
                  <li>User's current page URL and state are auto-saved</li>
                  <li>After re-login, user is redirected back to where they left off</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Modal */}
      <SessionExpirationModal
        isOpen={showWarningModal}
        showWarning={true}
        onLoginAgain={handleCloseModals}
      />

      {/* Expired Modal */}
      <SessionExpirationModal
        isOpen={showExpiredModal}
        showWarning={false}
        onLoginAgain={handleCloseModals}
      />
    </div>
  )
}
