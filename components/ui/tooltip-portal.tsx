'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipPortalProps {
  children: React.ReactNode
  content: string
  disabled?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  delayDuration?: number
}

export const TooltipPortal: React.FC<TooltipPortalProps> = ({
  children,
  content,
  disabled = false,
  side = 'right',
  align = 'center',
  sideOffset = 10,
  delayDuration = 400
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    let x = 0
    let y = 0

    // Calculate base position based on side
    switch (side) {
      case 'right':
        x = triggerRect.right + sideOffset
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - sideOffset
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.top - tooltipRect.height - sideOffset
        break
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.bottom + sideOffset
        break
    }

    // Apply alignment adjustments
    if (side === 'right' || side === 'left') {
      switch (align) {
        case 'start':
          y = triggerRect.top
          break
        case 'end':
          y = triggerRect.bottom - tooltipRect.height
          break
      }
    } else {
      switch (align) {
        case 'start':
          x = triggerRect.left
          break
        case 'end':
          x = triggerRect.right - tooltipRect.width
          break
      }
    }

    // Prevent tooltip from going off-screen (flip if needed)
    if (x < 8) x = 8
    if (x + tooltipRect.width > viewport.width - 8) {
      if (side === 'right') {
        // Flip to left
        x = triggerRect.left - tooltipRect.width - sideOffset
      } else {
        x = viewport.width - tooltipRect.width - 8
      }
    }

    if (y < 8) y = 8
    if (y + tooltipRect.height > viewport.height - 8) {
      y = viewport.height - tooltipRect.height - 8
    }

    setPosition({ x, y })
  }

  const showTooltip = () => {
    if (disabled) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      // Calculate position after the tooltip becomes visible
      requestAnimationFrame(calculatePosition)
    }, delayDuration)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const handleMouseEnter = () => showTooltip()
  const handleMouseLeave = () => hideTooltip()
  const handleFocus = () => showTooltip()
  const handleBlur = () => hideTooltip()

  const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 11)}`

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  if (!mounted) return <>{children}</>

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`fixed z-[9999] px-3 py-2 bg-white text-black text-sm rounded-lg shadow-xl whitespace-nowrap max-w-[240px] break-words border border-gray-200 ${
            prefersReducedMotion ? '' : 'animate-in fade-in-0 zoom-in-95 duration-200'
          }`}
          style={{
            left: position.x,
            top: position.y,
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
          {/* Arrow indicator */}
          <div 
            className={`absolute w-2 h-2 bg-white border border-gray-200 transform rotate-45 ${
              side === 'right' ? '-left-1 top-1/2 -translate-y-1/2 border-r-0 border-b-0' :
              side === 'left' ? '-right-1 top-1/2 -translate-y-1/2 border-l-0 border-t-0' :
              side === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2 border-r-0 border-b-0' :
              '-top-1 left-1/2 -translate-x-1/2 border-l-0 border-t-0'
            }`}
          />
        </div>,
        document.body
      )}
    </>
  )
}