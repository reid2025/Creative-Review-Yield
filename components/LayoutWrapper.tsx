'use client'

import { usePathname } from 'next/navigation'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { SidebarProvider } from '@/components/SidebarProvider'
import { Sidebar } from '@/components/Sidebar'
import { Loader2 } from 'lucide-react'
import { useSessionMonitor } from '@/hooks/useSessionMonitor'
import { SessionExpirationModal } from '@/components/SessionExpirationModal'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading } = useGoogleAuth()

  // Monitor session expiration
  const {
    showExpirationModal,
    showWarningModal,
    setShowExpirationModal,
    handleRefreshSession
  } = useSessionMonitor()

  // Hide sidebar on login page or when not authenticated
  const hideSidebar = pathname === '/login' || !user
  
  // Show loading state while checking authentication
  if (isLoading && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-[#e5e5e5] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }
  
  if (hideSidebar) {
    return (
      <div className="min-h-screen bg-[#e5e5e5]">
        {children}
      </div>
    )
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black">
        <Sidebar />

        <div className="flex flex-col bg-[#e5e5e5] rounded-tl-[28px] rounded-bl-[28px] overflow-visible relative z-10 flex-1">
          <main className="flex flex-col gap-4 px-[30px] py-[30px] flex-1 overflow-y-auto h-full overflow-x-visible relative">
            {children}
          </main>
        </div>
      </div>

      {/* Session Expiration Modal */}
      <SessionExpirationModal
        isOpen={showExpirationModal || showWarningModal}
        showWarning={showWarningModal && !showExpirationModal}
        onLoginAgain={handleRefreshSession}
      />
    </SidebarProvider>
  )
}