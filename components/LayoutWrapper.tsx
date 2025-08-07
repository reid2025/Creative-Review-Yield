'use client'

import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/components/SidebarProvider'
import { Sidebar } from '@/components/Sidebar'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide sidebar on login, register, and auth-test pages
  const hideSidebar = pathname === '/login' || pathname === '/register' || pathname === '/auth-test'
  
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
          <main className="flex flex-col gap-4 px-[50px] py-[50px] flex-1 overflow-y-auto h-full overflow-x-visible relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}