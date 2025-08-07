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
import { useAuth } from "@/contexts/AuthContext"

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
          className="fixed top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none z-40"
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
    <div className="px-4 pt-6 pb-8 flex justify-center relative overflow-hidden">
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
            className="w-15 h-15 group-hover:brightness-110 transition-all duration-300"
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
            className="w-full h-auto group-hover:brightness-110 transition-all duration-300"
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
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
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
    <nav className="px-4 pt-6 overflow-y-auto overflow-x-hidden">
      <ul className="space-y-2">
        {sidebarNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={
              item.href === "/upload" 
                ? pathname.startsWith("/upload")
                : pathname === item.href
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
      <div className="border-t border-[#333333] mb-4"></div>
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
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U'
    if (user.displayName) {
      const names = user.displayName.split(' ')
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }
  
  const displayName = user?.displayName || 'User'
  const displayEmail = user?.email || 'Not logged in'

  return (
    <div className="relative">
      {/* Subtle gradient separation */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="p-4 pt-6">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 text-left w-full focus:outline-none group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#89DA1A] flex items-center justify-center text-white font-semibold text-sm group-hover:bg-[#7cc516] transition-all duration-300">
                  {getUserInitials()}
                </div>
                {user && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#89DA1A] rounded-full border-2 border-black" />}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/60 truncate">{displayEmail}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0 group-hover:text-white/60 transition-colors" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align={isCollapsed ? "center" : "start"}>
              <div className="px-2 py-3 border-b border-gray-100">
                <div className="text-sm font-medium text-black">{displayName}</div>
                <div className="text-xs text-gray-500">{displayEmail}</div>
              </div>
              <div className="py-1">
                {user ? (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/drafts" className="flex items-center">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>My Drafts</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/login" className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign In</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/register" className="flex items-center">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="ml-2 p-2 rounded-lg bg-[#89DA1A] hover:bg-[#7cc516] text-black transition-colors"
            >
              <Image
                src="/assets/icons/002-plus.png"
                alt="Action"
                width={16}
                height={16}
                style={{ filter: "brightness(0)" }}
              />
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

/**
 * SidebarFooter - Footer section with collapse toggle
 */
const _SidebarFooter: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <div className="mt-auto overflow-hidden border-t-0">
      {/* Lightbulb tooltip section */}
      <div className={cn(
        "flex cursor-pointer overflow-hidden",
        isCollapsed ? "px-4 pb-6" : "px-4 py-6"
      )}>
        <div className={cn(
          "bg-[#242527] hover:bg-[#414143] rounded-lg flex items-center group overflow-hidden",
          isCollapsed ? "w-full h-12 justify-center" : "p-3 gap-3 w-full"
        )}>
          <Image
            src="/assets/icons/011-lamp.png"
            alt="Lightbulb"
            width={24}
            height={24}
            className="flex-shrink-0"
          />
          <span className={cn(
            "text-[15px] font-medium text-[#ffffffb3] transition-all ease-in-out",
            isCollapsed ? "opacity-0 duration-75 w-0" : "opacity-100 duration-300 delay-300"
          )}>
            New idea in mind?
          </span>
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-t border-[#333333]"></div>

      {/* Collapse Sidebar */}
      <button 
        onClick={toggleSidebar}
        className={cn(
          "flex items-center h-[60px] text-[15px] font-semibold text-[#ffffffb3] hover:text-[#89DA1A] w-full",
          isCollapsed ? "justify-center" : "gap-3 px-[30px]"
        )}
      >
        <Image
          src="/assets/icons/007-side-bar.png"
          alt={isCollapsed ? "Expand" : "Collapse"}
          width={22}
          height={22}
          className="flex-shrink-0 opacity-70 hover:opacity-100"
          style={{
            filter: "brightness(0) invert(1)"
          }}
        />
        <span className={cn(
          "transition-all ease-in-out",
          isCollapsed ? "opacity-0 duration-75 w-0" : "opacity-100 duration-300 delay-300"
        )}>
          {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        </span>
      </button>
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
      aria-expanded={!isCollapsed}
    >
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
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