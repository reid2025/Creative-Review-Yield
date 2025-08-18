'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { CreativeHistoryEntry } from '@/types/creative'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, History } from 'lucide-react'

interface PerformanceHoverCardProps {
  history?: CreativeHistoryEntry[]
  children: React.ReactNode
}

export function PerformanceHoverCard({ history, children }: PerformanceHoverCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  // Check if we have meaningful data
  const hasMeaningfulData = history && history.length > 0 && history.some(entry => 
    parseFloat(entry.cost || '0') > 0 || 
    parseFloat(entry.costPerWebsiteLead || '0') > 0 || 
    parseFloat(entry.costPerLinkClick || '0') > 0
  )

  // Don't render hover functionality if no meaningful data
  if (!hasMeaningfulData) {
    return <>{children}</>
  }

  // Sort history by date (ascending for chart, but we'll get latest by date)
  const sortedHistory = [...(history || [])].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB
  })

  // Get the actual latest entry by date (not by array position)
  const sortedByDateDesc = [...(history || [])].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA // Descending to get latest first
  })
  
  // Show all entries in chart, dynamically sized
  const chartData = sortedHistory.map(entry => ({
    date: format(new Date(entry.date), 'MMM dd'),
    cost: parseFloat(entry.cost || '0'),
    cpl: parseFloat(entry.costPerWebsiteLead || '0'),
    cpc: parseFloat(entry.costPerLinkClick || '0'),
  }))
  
  // Calculate dynamic dimensions based on number of entries
  const entriesCount = sortedHistory.length
  const chartHeight = Math.min(400, Math.max(150, entriesCount * 6)) // Min 150px, max 400px
  const cardWidth = Math.min(800, Math.max(400, entriesCount * 12)) // Min 400px, max 800px for 40+ entries

  // Get latest metrics based on actual date (not array position)
  const latestEntry = sortedByDateDesc[0] // Most recent by date
  const previousEntry = sortedByDateDesc[1] // Second most recent by date
  
  // Calculate trends
  const calculateTrend = (current?: string, previous?: string) => {
    if (!current || !previous) return 0
    const curr = parseFloat(current)
    const prev = parseFloat(previous)
    if (prev === 0) return 0
    return ((curr - prev) / prev) * 100
  }

  const costTrend = calculateTrend(latestEntry?.cost, previousEntry?.cost)
  const cplTrend = calculateTrend(latestEntry?.costPerWebsiteLead, previousEntry?.costPerWebsiteLead)
  const cpcTrend = calculateTrend(latestEntry?.costPerLinkClick, previousEntry?.costPerLinkClick)

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    // Add a small delay before hiding to prevent flickering
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 100)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    
    const padding = 20
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Calculate position relative to viewport
    let x = e.clientX + padding
    let y = e.clientY + padding
    
    // Adjust if card would go off right edge
    if (x + cardWidth > viewportWidth) {
      x = e.clientX - cardWidth - padding
    }
    
    // Adjust if card would go off bottom edge
    if (y + (chartHeight + 200) > viewportHeight) {
      y = e.clientY - (chartHeight + 200) - padding
    }
    
    setPosition({ x, y })
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const TrendIcon = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.01) return null
    return value > 0 
      ? <TrendingUp className="h-3 w-3 text-red-500" />
      : <TrendingDown className="h-3 w-3 text-green-500" />
  }

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="inline-block"
    >
      {children}
      
      {isVisible && (
        <div
          ref={cardRef}
          className="fixed z-[100] pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transition: 'opacity 0.15s ease-in-out',
            opacity: isVisible ? 1 : 0
          }}
          onMouseEnter={() => {
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current)
              hideTimeoutRef.current = null
            }
          }}
        >
          <Card 
            className="bg-white/95 backdrop-blur shadow-xl border-2"
            style={{ width: `${cardWidth}px` }}
          >
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-sm">Performance History</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {history?.length} updates
                </Badge>
              </div>

              {/* Current Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Total Spend</div>
                  <div className="font-bold text-sm">{formatCurrency(latestEntry?.cost || 0)}</div>
                  {previousEntry && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <TrendIcon value={costTrend} />
                      <span className={costTrend > 0 ? 'text-red-600' : 'text-green-600'}>
                        {Math.abs(costTrend).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Cost/Lead</div>
                  <div className="font-bold text-sm">{formatCurrency(latestEntry?.costPerWebsiteLead || 0)}</div>
                  {previousEntry && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <TrendIcon value={cplTrend} />
                      <span className={cplTrend > 0 ? 'text-red-600' : 'text-green-600'}>
                        {Math.abs(cplTrend).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Cost/Click</div>
                  <div className="font-bold text-sm">{formatCurrency(latestEntry?.costPerLinkClick || 0)}</div>
                  {previousEntry && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <TrendIcon value={cpcTrend} />
                      <span className={cpcTrend > 0 ? 'text-red-600' : 'text-green-600'}>
                        {Math.abs(cpcTrend).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Chart - Shows ALL history entries */}
              {chartData.length > 1 && (
                <div style={{ height: `${chartHeight}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: entriesCount > 20 ? 8 : 10 }}
                        stroke="#888"
                        angle={entriesCount > 15 ? -45 : 0}
                        textAnchor={entriesCount > 15 ? "end" : "middle"}
                        height={entriesCount > 15 ? 50 : 30}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        stroke="#888"
                        domain={[0, 'auto']}
                        hide
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: entriesCount > 30 ? 2 : 3 }}
                        name="Spend"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cpl" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: entriesCount > 30 ? 2 : 3 }}
                        name="CPL"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cpc" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ r: entriesCount > 30 ? 2 : 3 }}
                        name="CPC"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Latest Update Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>Last updated: {format(new Date(latestEntry?.date || new Date()), 'MMM dd, yyyy')}</span>
                <Badge variant="secondary" className="text-xs">
                  {latestEntry?.dataSource || 'manual'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PerformanceHoverCard