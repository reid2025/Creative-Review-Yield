"use client"

import { Header } from "@/components/Header"
import { InnerMenu, InnerMenuItem } from "@/components/InnerMenu"

interface PageLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  innerMenuItems?: InnerMenuItem[]
  activeMenuItem?: string
  onMenuItemChange?: (itemId: string) => void
}

export function PageLayout({ 
  children, 
  pageTitle, 
  innerMenuItems, 
  activeMenuItem, 
  onMenuItemChange 
}: PageLayoutProps) {
  const innerMenu = innerMenuItems && activeMenuItem && onMenuItemChange ? (
    <InnerMenu 
      items={innerMenuItems}
      activeItem={activeMenuItem}
      onItemChange={onMenuItemChange}
    />
  ) : undefined

  return (
    <>
      <Header pageTitle={pageTitle} innerMenu={innerMenu} />
      <div className="space-y-6">
        {children}
      </div>
    </>
  )
}