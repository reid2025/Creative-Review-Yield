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
import { ChevronDown, LogOut, Settings, Book, ChevronLeft, ChevronRight } from "lucide-react"
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
import { QuickAddModal } from "@/components/QuickAddModal"
import { useGoogleAuth } from "@/contexts/GoogleAuthContext"

// ===========================
// Internal Component Interfaces
// ===========================

interface EdgeTriggerProps {
  isCollapsed: boolean
  onToggle: () => void
}

interface FloatingExpandButtonProps {
  isVisible: boolean
  onClick: () => void
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
 * EdgeTrigger - Hoverable edge control for sidebar collapse/expand
 */
const EdgeTrigger: React.FC<EdgeTriggerProps> = ({ isCollapsed, onToggle }) => {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <>
      {/* Elegant hover trigger */}
      <div
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50",
          "w-6 h-12 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:w-8 hover:h-16",
          isHovering && "bg-white/5"
        )}
        style={{
          left: isCollapsed ? '-12px' : '253px',
          cursor: isHovering ? 'pointer' : 'default'
        }}
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
        {/* Chevron icon */}
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            isHovering ? "opacity-70 scale-110" : "opacity-0 scale-90"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white/60" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/60" />
          )}
        </div>
      </div>

      {/* Vertical line indicator when hovering */}
      {isHovering && !isCollapsed && (
        <div
          className="top-0 z-40 fixed bg-gradient-to-b from-transparent via-white/10 to-transparent w-px h-full pointer-events-none"
          style={{ left: '265px' }}
        />
      )}
    </>
  )
}

/**
 * FloatingExpandButton - Animated floating button visible when sidebar is collapsed
 */
const FloatingExpandButton: React.FC<FloatingExpandButtonProps> = ({ isVisible, onClick }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!buttonRef.current) return

    // Create and inject styles for the pulse animation
    const styleId = 'floating-expand-button-styles'
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.textContent = `
        @keyframes floating-pulse-subtle {
          0%, 100% {
            transform: translateY(-50%) scale(1);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
          50% {
            transform: translateY(-50%) scale(1.05);
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          }
        }
        
        .floating-expand-button {
          animation: floating-pulse-subtle 3s ease-in-out infinite;
        }
        
        .floating-expand-button:hover {
          animation: none;
        }
      `
      document.head.appendChild(styleElement)
    }

    return () => {
      // Cleanup styles if no other instances exist
      const buttons = document.querySelectorAll('.floating-expand-button')
      if (buttons.length === 0 && styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement)
      }
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={cn(
        'floating-expand-button',
        'fixed left-0 top-1/2 -translate-y-1/2 z-50',
        'w-8 h-8 rounded-full',
        'bg-black/70 backdrop-blur-sm',
        'flex items-center justify-center',
        'transition-all duration-300 ease-in-out',
        'hover:bg-black/80 hover:scale-110',
        'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
        'shadow-[0_0_20px_rgba(255,255,255,0.3)]',
        'hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]',
        isVisible
          ? 'opacity-100 translate-x-0 pointer-events-auto'
          : 'opacity-0 -translate-x-full pointer-events-none'
      )}
      aria-label="Expand sidebar"
      aria-expanded={false}
      type="button"
    >
      <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
    </button>
  )
}

/**
 * SidebarLogo - Displays collapsed/expanded logo with smooth transitions
 */
const SidebarLogo: React.FC = () => {
  const { isCollapsed } = useSidebar()

  return (
    <div className="relative flex justify-center px-4 pt-6 pb-8 overflow-hidden">
      <Link 
        href="/" 
        className="group cursor-pointer"
        aria-label="Go to Dashboard"
      >
        {/* Collapsed Logo */}
        <div className={cn(
          "absolute transition-all duration-300 ease-in-out",
          isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <Image
            src="/assets/logo/cry-logo.png"
            alt="CRY"
            width={60}
            height={60}
            className="group-hover:brightness-110 w-15 h-15 transition-all duration-300"
          />
        </div>
        
        {/* Expanded Logo */}
        <div className={cn(
          "transition-all duration-300 ease-in-out delay-100",
          isCollapsed ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}>
          <Image
            src="/assets/logo/logo-full.png"
            alt="Creative Review Yield"
            width={263}
            height={60}
            className="group-hover:brightness-110 w-full h-auto transition-all duration-300"
          />
          <p className={cn(
            "text-[0.8rem] italic text-[#ffffffb3] mt-2 transition-all ease-in-out group-hover:text-white/80",
            isCollapsed ? "opacity-0 duration-75" : "opacity-100 duration-300 delay-300"
          )}>
            Because every ad starts with a breakdown
          </p>
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
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <li className="relative">
      <Link
        href={href}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "flex items-center text-[15px] font-medium transition-all duration-300 ease-out relative",
          isCollapsed ? "justify-center mx-auto w-14 h-14 rounded-2xl" : "rounded-xl",
          isActive
            ? isCollapsed 
              ? "bg-[#89DA1A] shadow-lg shadow-[#89DA1A]/20"
              : "bg-gradient-to-r from-[#89DA1A] to-[#7BC617] text-black shadow-lg shadow-[#89DA1A]/20"
            : "text-white/70 hover:text-white hover:bg-white/5"
        )}
        style={
          isCollapsed 
            ? {} 
            : { 
                padding: "12px 20px 12px 24px", 
                height: "56px",
                marginLeft: "4px",
                marginRight: "4px"
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
          "font-medium transition-all ease-out",
          isCollapsed 
            ? "opacity-0 w-0 overflow-hidden duration-75" 
            : "opacity-100 duration-300 delay-100 ml-3"
        )}>
          {label}
        </span>
      </Link>

      {/* Tooltip for collapsed state */}
      {isCollapsed && showTooltip && (
        <div className="top-1/2 left-full z-50 absolute ml-4 -translate-y-1/2">
          <div className="bg-gray-900 shadow-xl px-3 py-2 rounded-lg text-white text-sm whitespace-nowrap">
            {label}
            <div className="top-1/2 right-full absolute border-8 border-transparent border-r-gray-900 -translate-y-1/2" />
          </div>
        </div>
      )}
    </li>
  )
}

/**
 * SidebarNav - Main navigation container
 */
const SidebarNav: React.FC = () => {
  const pathname = usePathname()

  return (
    <nav className="px-4 pt-6 overflow-x-hidden overflow-y-auto">
      <ul className="space-y-2">
        {sidebarNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href || 
              (item.href === "/google-sheets-records" && pathname.startsWith("/google-sheets-records"))
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
                "flex items-center text-[15px] font-medium group transition-all duration-300 ease-in-out",
                isCollapsed ? "justify-center mx-auto w-12 h-12" : "gap-3",
                "text-[#ffffffb3] hover:text-white rounded-lg"
              )}
              style={isCollapsed ? {} : { padding: "8px 16px 8px 30px", height: "53px" }}
            >
              <item.icon 
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all duration-300 ease-in-out",
                  "opacity-70 group-hover:opacity-100"
                )}
              />
              <span className={cn(
                "transition-all ease-in-out",
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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
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
      
      <div className="p-4 pt-6">
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-3 focus:outline-none w-full text-left">
              <div className="relative">
                <div className="flex justify-center items-center bg-[#89DA1A] group-hover:bg-[#7cc516] rounded-full w-10 h-10 font-semibold text-white text-sm transition-all duration-300">
                  {getUserInitials()}
                </div>
                {user && <div className="right-0 bottom-0 absolute bg-[#89DA1A] border-2 border-black rounded-full w-3 h-3" />}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{displayName}</p>
                    <p className="text-white/60 text-xs truncate">{displayEmail}</p>
                  </div>
                  <ChevronDown className="flex-shrink-0 w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align={isCollapsed ? "center" : "start"}>
              <div className="px-2 py-3 border-gray-100 border-b">
                <div className="font-medium text-black text-sm">{displayName}</div>
                <div className="text-gray-500 text-xs">{displayEmail}</div>
              </div>
              <div className="py-1">
                {user ? (
                  <>
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
          
          {!isCollapsed && (
            <button 
              onClick={() => setIsQuickAddOpen(true)}
              className="bg-[#89DA1A] hover:bg-[#7cc516] shadow-sm hover:shadow-md ml-2 px-3 rounded-full focus:outline-none focus:ring-[#89DA1A]/60 focus:ring-2 h-10 font-medium text-black active:scale-[0.98] transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <Image
                  src="/assets/icons/002-plus.png"
                  alt="Action"
                  width={16}
                  height={16}
                  style={{ filter: "brightness(0)" }}
                />
                Quick Add
              </span>
            </button>
          )}
        </div>
      </div>
      
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
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
      <div className="flex-1" />
      <SidebarTools />
      <SidebarProfile />
      {/* <SidebarFooter /> */}
      
      {/* Edge trigger for expand/collapse */}
      <EdgeTrigger
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
      />
      
      {/* Floating button when collapsed */}
      <FloatingExpandButton 
        isVisible={isCollapsed} 
        onClick={toggleSidebar}
      />
    </div>
  )
}