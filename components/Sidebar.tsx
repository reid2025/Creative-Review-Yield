/**
 * Sidebar Component
 * 
 * A comprehensive sidebar navigation component for the CRY application.
 * Includes collapsible functionality, user profile, navigation items,
 * and various interactive elements.
 * 
 * @module components/Sidebar
 * @version 2.0.0
 * 
 * Features:
 * - Collapsible sidebar with smooth animations
 * - Keyboard shortcuts (Cmd/Ctrl + B)
 * - Edge triggers for expand/collapse
 * - User profile dropdown
 * - Navigation items with active states
 * - Mobile responsive
 * 
 * Last Updated: 2025-01-27
 */

"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, LogOut, Settings, Book, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"
import { sidebarNavItems } from "@/config/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGoogleAuth } from "@/contexts/GoogleAuthContext"
import { TooltipPortal } from "@/components/ui/tooltip-portal"

// ===========================
// Internal Component Interfaces
// ===========================

interface EdgeTriggerProps {
  isCollapsed: boolean
  onToggle: () => void
}


interface SidebarNavItemProps {
  href: string
  icon: string
  label: string
  isActive: boolean
}

// ===========================
// Internal Components (Not Exported)
// ===========================

/**
 * EdgeTrigger - Full-height edge strip for sidebar toggle
 */
const EdgeTrigger: React.FC<EdgeTriggerProps> = ({ isCollapsed, onToggle }) => {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <>
      {/* Full-height edge strip */}
      <div
        className={cn(
          "absolute top-0 right-0 z-50 h-full",
          "w-3 cursor-pointer",
          "flex items-center justify-center",
          "transition-all duration-200 ease-out",
          isHovering && "bg-gradient-to-r from-white/5 via-white/10 to-white/5"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onToggle}
        role="button"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        {/* Chevron icon that fades in on hover */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "transition-all duration-200 ease-out",
            isHovering ? "opacity-70" : "opacity-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-white" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white" />
          )}
        </div>
      </div>
    </>
  )
}


/**
 * SidebarLogo - Displays collapsed/expanded logo with smooth transitions
 */
const SidebarLogo: React.FC = () => {
  const { isCollapsed } = useSidebar()

  return (
    <div className={cn(
      "relative overflow-hidden",
      isCollapsed ? "flex justify-center items-center px-4 pt-6 pb-4" : "flex justify-center px-4 pt-6 pb-8"
    )}>
      <Link 
        href="/" 
        className="group cursor-pointer"
        aria-label="Go to Dashboard"
      >
        {/* Collapsed Logo */}
        <div className={cn(
          "transition-all duration-300 ease-in-out flex justify-center items-center",
          isCollapsed ? "opacity-100 scale-100 w-14 h-14 mx-auto" : "opacity-0 scale-95 absolute"
        )}>
          <Image
            src="/assets/logo/star-logo.svg"
            alt="Creative Tracker"
            width={56}
            height={56}
            className="group-hover:brightness-110 transition-all duration-300"
            style={{
              height: '2.5rem',
              animation: 'bounce-rotate 30s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = 'bounce-rotate-fast 3s ease-in-out infinite'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = 'bounce-rotate 30s ease-in-out infinite'
            }}
          />
        </div>

        {/* Expanded Logo */}
        <div className={cn(
          "transition-all duration-300 ease-in-out delay-100",
          isCollapsed ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}>
          <Image
            src="/assets/logo/creative-tracker-logo.svg"
            alt="Creative Tracker"
            width={263}
            height={60}
            className="group-hover:brightness-110 w-full h-auto transition-all duration-300"
          />
        </div>
      </Link>
    </div>
  )
}

/**
 * SidebarNavItem - Individual navigation item with active state and tooltip
 */
const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ href, icon, label, isActive }) => {
  const { isCollapsed } = useSidebar()

  return (
    <li className="relative">
      <TooltipPortal 
        content={label} 
        disabled={!isCollapsed}
        side="right"
        align="center"
        sideOffset={12}
        delayDuration={300}
      >
        <Link
          href={href}
          className={cn(
            "flex items-center text-[15px] transition-all duration-300 ease-out relative",
            isCollapsed ? "justify-center mx-auto w-14 h-14 rounded-2xl" : "rounded-xl",
            isActive
              ? isCollapsed 
                ? "bg-[#89DA1A] shadow-lg shadow-[#89DA1A]/20"
                : "bg-gradient-to-r from-[#89DA1A] to-[#7BC617] shadow-lg shadow-[#89DA1A]/20"
              : "text-white hover:text-white hover:bg-white/5"
          )}
          style={
            isCollapsed 
              ? {} 
              : { 
                  padding: "12px 20px 12px 24px", 
                  height: "56px",
                  marginLeft: "4px",
                  marginRight: "4px",
                  color: isActive ? "#000000" : "#ffffff"
                }
          }
        >
          <Image
            src={`/assets/icons/${icon}`}
            alt={label}
            width={22}
            height={22}
            className={cn(
              "flex-shrink-0 transition-all duration-300 ease-out",
              !isActive && "group-hover:scale-110"
            )}
            style={{
              filter: isActive 
                ? "brightness(0) invert(0)" 
                : "brightness(0) invert(1) opacity(0.8)"
            }}
          />
          <span className={cn(
            "transition-all ease-out",
            isCollapsed 
              ? "opacity-0 w-0 overflow-hidden duration-75" 
              : "opacity-100 duration-300 delay-100 ml-3"
          )}
          style={{
            color: isActive ? "#000000" : "#ffffff"
          }}>
            {label}
          </span>
        </Link>
      </TooltipPortal>
    </li>
  )
}

/**
 * SidebarNav - Main navigation container
 */
const SidebarNav: React.FC = () => {
  const pathname = usePathname()

  return (
    <nav className="px-4 pt-6 overflow-x-hidden overflow-y-auto flex-1 flex flex-col justify-center">
      <ul className="space-y-2">
        {sidebarNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href ||
              (item.href === "/creative-stream" && pathname.startsWith("/creative-stream"))
            }
          />
        ))}
      </ul>
    </nav>
  )
}

/**
 * SidebarTools - Bottom tools section with settings and glossary
 */
const SidebarTools: React.FC = () => {
  const { isCollapsed } = useSidebar()
  const pathname = usePathname()

  const toolItems = [
    {
      label: "Tag Glossary",
      icon: Book,
      href: "/tag-glossary"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings"
    }
  ]

  return (
    <div className="px-4 py-4">
      <div className="mb-4 border-[#333333] border-t"></div>
      <ul className="space-y-1">
        {toolItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center text-[15px] group transition-all duration-300 ease-in-out rounded-lg",
                isCollapsed ? "justify-center mx-auto w-12 h-12" : "gap-3",
                pathname === item.href
                  ? "bg-white text-black" // Active state
                  : "text-white hover:text-white hover:bg-white/5" // Inactive state
              )}
              style={isCollapsed ? {} : { padding: "8px 16px 8px 30px", height: "53px" }}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all duration-300 ease-in-out",
                  pathname === item.href
                    ? "text-black" // Active state - black icon
                    : "text-white group-hover:text-white" // Inactive state - white icon
                )}
              />
              <span className={cn(
                "transition-all ease-in-out",
                pathname === item.href ? "text-black" : "text-white", // Active state text color
                isCollapsed ? "opacity-0 w-0 overflow-hidden duration-75" : "opacity-100 duration-300 delay-300"
              )}>
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * SidebarProfile - User profile section with dropdown menu
 */
const SidebarProfile: React.FC = () => {
  const { isCollapsed } = useSidebar()
  const { user, signOut } = useGoogleAuth()
  const router = useRouter()
  
  const handleLogout = () => {
    signOut()
  }
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U'
    if (user.name) {
      const names = user.name.split(' ')
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }
  
  const displayName = user?.name || 'User'
  const displayEmail = user?.email || 'Not logged in'

  return (
    <div className="relative">
      {/* Subtle gradient separation */}
      <div className="top-0 absolute inset-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-px" />
      
      <div className={cn(
        "p-4 pt-6",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between w-full"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "group flex items-center focus:outline-none text-left transition-all duration-300",
              isCollapsed ? "justify-center" : "gap-3 w-full"
            )}>
              <div className="relative">
                <div className="flex justify-center items-center bg-[#89DA1A] group-hover:bg-[#7cc516] rounded-full w-10 h-10 font-semibold text-white text-sm transition-all duration-300 focus:ring-2 focus:ring-[#89DA1A]/60 focus:ring-offset-2 focus:ring-offset-black">
                  {getUserInitials()}
                </div>
                {user && <div className="right-0 bottom-0 absolute bg-[#89DA1A] border-2 border-black rounded-full w-3 h-3" />}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{displayName}</p>
                    <p className="text-white text-xs truncate">{displayEmail}</p>
                  </div>
                  <ChevronDown className="flex-shrink-0 w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align={isCollapsed ? "center" : "start"}>
              <div className="px-2 py-3 border-gray-100 border-b">
                <div className="text-black text-sm">{displayName}</div>
                <div className="text-gray-500 text-xs">{displayEmail}</div>
              </div>
              <div className="py-1">
                {user ? (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/my-drafts" className="flex items-center">
                        <FileText className="mr-2 w-4 h-4" />
                        <span>My Drafts</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 w-4 h-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/login" className="flex items-center">
                        <LogOut className="mr-2 w-4 h-4" />
                        <span>Sign In</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/register" className="flex items-center">
                        <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Sign Up</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
        </div>
      </div>
      
    </div>
  )
}


// ===========================
// Main Exported Component
// ===========================

/**
 * Sidebar - Main sidebar component with all features integrated
 */
export const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Prevent rapid toggles
  const handleToggle = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    toggleSidebar()
    setTimeout(() => setIsAnimating(false), 300)
  }, [toggleSidebar, isAnimating])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        handleToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleToggle])

  // Focus management
  useEffect(() => {
    if (isCollapsed && sidebarRef.current) {
      const mainContent = document.querySelector('main')
      if (mainContent instanceof HTMLElement) {
        mainContent.focus()
      }
    }
  }, [isCollapsed])

  return (
    <div 
      id="menu-sidebar"
      ref={sidebarRef}
      className={cn(
        "flex h-screen flex-col bg-[#000] text-white flex-shrink-0 relative",
        "transition-all duration-300 ease-in-out rounded-bl-[28px]",
        "transform-gpu will-change-[width] sidebar-transition",
        isCollapsed ? "w-[100px]" : "w-[265px]",
        isAnimating && "pointer-events-none"
      )}
      data-stagewise-component="sidebar"
      data-stagewise-version="2.0"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:top-4 focus:left-4 focus:absolute"
      >
        Skip to main content
      </a>

      <SidebarLogo />
      <SidebarNav />
      <SidebarTools />
      <SidebarProfile />
      {/* <SidebarFooter /> */}
      
      {/* Edge trigger for expand/collapse - desktop only */}
      <div className="hidden md:block">
        <EdgeTrigger
          isCollapsed={isCollapsed}
          onToggle={handleToggle}
        />
      </div>
    </div>
  )
}