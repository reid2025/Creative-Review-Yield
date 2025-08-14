// ✅ Updated Header with breadcrumbs and removed bottom border – 2025-01-27 (by Cursor AI)

"use client"

import { HeaderActions } from "./header/HeaderActions"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

interface HeaderProps {
  pageTitle?: string
  innerMenu?: React.ReactNode
  hideBreadcrumbs?: boolean
}

export function Header({ pageTitle, innerMenu, hideBreadcrumbs }: HeaderProps) {
  return (
    <header className="bg-[#e5e5e5]">
      <div className="grid grid-cols-3 items-center px-8 py-6">
        {/* Left Zone - Breadcrumbs */}
        <div className="flex justify-start">
          {!hideBreadcrumbs && <HeaderBreadcrumbs pageTitle={pageTitle} />}
        </div>
        
        {/* Center Zone - Inner Menu Area */}
        <div className="flex justify-center">
          {innerMenu || <div className="text-sm text-gray-500">Inner Menu Area</div>}
        </div>
        
        {/* Right Zone - Actions */}
        <div className="flex justify-end">
          <HeaderActions />
        </div>
      </div>
    </header>
  )
}

function HeaderBreadcrumbs({ pageTitle }: { pageTitle?: string }) {
  const pathname = usePathname()
  
  const getDefaultPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return 'Dashboard'
    
    const lastSegment = segments[segments.length - 1]
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  const segments = pathname.split('/').filter(Boolean)
  
  // For upload routes, only show up to the 'upload' segment
  const breadcrumbSegments = pathname.startsWith('/upload') && segments.length > 1 
    ? ['upload'] 
    : segments
  
  
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex flex-wrap items-center break-words text-xs text-muted-foreground gap-1">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbSegments.map((segment, index) => {
          const href = '/' + breadcrumbSegments.slice(0, index + 1).join('/')
          const isLast = index === breadcrumbSegments.length - 1
          const name = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          return (
            <div key={href} className="flex items-center">
              <BreadcrumbSeparator className="mx-3">/</BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast && !pageTitle ? (
                  <BreadcrumbPage className="font-instrument tracking-tightest text-[2.363rem] text-foreground">
                    {name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{name}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

 