"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/Header"
import { UploadTabControls } from "@/components/upload/UploadTabs"
import { UploadProvider } from "@/components/upload/UploadContext"

export function DynamicHeader() {
  const pathname = usePathname()
  
  // Check if we're on any upload subpage (but not the main upload selection page)
  const isUploadSubPage = pathname.startsWith('/upload/') && pathname !== '/upload'
  
  // Check if we're on a tag detail page
  const isTagDetailPage = pathname.match(/^\/tag-glossary\/tag\/[^\/]+$/)
  
  if (isUploadSubPage) {
    return (
      <UploadProvider>
        <Header 
          pageTitle="Upload Creatives" 
          innerMenu={<UploadTabControls />} 
        />
      </UploadProvider>
    )
  }
  
  // Show header for tag detail pages but with a flag to hide breadcrumbs
  if (isTagDetailPage) {
    return <Header hideBreadcrumbs={true} />
  }
  
  // Default header for other pages
  return <Header />
}