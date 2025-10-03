'use client'

import { formatCTDate, fromFirebaseTimestamp } from '@/lib/timezone-utils'
import { CreativeHistoryEntry } from '@/types/creative'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, DollarSign, MousePointer, Target } from 'lucide-react'

interface CostHistoryTooltipProps {
  children: React.ReactNode
  history?: CreativeHistoryEntry[]
  currentCost?: string
  currentCPL?: string
  currentCPC?: string
}

export function CostHistoryTooltip({
  children,
  history,
  currentCost,
  currentCPL,
  currentCPC
}: CostHistoryTooltipProps) {
  
  if (!history || history.length === 0) {
    return <>{children}</>
  }

  // Calculate trends
  const calculateTrend = (current: string, previous: string) => {
    const currentVal = parseFloat(current || '0')
    const previousVal = parseFloat(previous || '0')
    if (previousVal === 0) return 0
    return ((currentVal - previousVal) / previousVal) * 100
  }

  const lastHistory = history[history.length - 1]
  const costTrend = currentCost && lastHistory ? calculateTrend(currentCost, lastHistory.cost) : 0
  const cplTrend = currentCPL && lastHistory ? calculateTrend(currentCPL, lastHistory.costPerWebsiteLead) : 0
  const cpcTrend = currentCPC && lastHistory ? calculateTrend(currentCPC, lastHistory.costPerLinkClick) : 0

  const TrendIcon = ({ trend, inverse = false }: { trend: number, inverse?: boolean }) => {
    // For costs, up is bad (red), down is good (green)
    // inverse flag can flip this logic if needed
    const isPositive = inverse ? trend < 0 : trend > 0
    const isNegative = inverse ? trend > 0 : trend < 0
    
    if (isPositive) return <TrendingUp className="h-3 w-3 text-red-500" />
    if (isNegative) return <TrendingDown className="h-3 w-3 text-green-500" />
    return <Minus className="h-3 w-3 text-gray-400" />
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

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <span className="cursor-help">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-96" align="start">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Performance History</h4>
            <Badge variant="secondary" className="text-xs">
              {history.length} updates
            </Badge>
          </div>

          {/* Current Metrics */}
          <div className="space-y-2 border-b pb-3">
            <div className="text-xs text-gray-600">Current Metrics</div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <DollarSign className="h-3 w-3" />
                  <span>Total Spend</span>
                </div>
                <div className="font-semibold text-sm">{formatCurrency(currentCost || '0')}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon trend={costTrend} />
                  <span className={costTrend > 0 ? 'text-red-600' : costTrend < 0 ? 'text-green-600' : 'text-gray-500'}>
                    {Math.abs(costTrend).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Target className="h-3 w-3" />
                  <span>CPL</span>
                </div>
                <div className="font-semibold text-sm">{formatCurrency(currentCPL || '0')}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon trend={cplTrend} />
                  <span className={cplTrend > 0 ? 'text-red-600' : cplTrend < 0 ? 'text-green-600' : 'text-gray-500'}>
                    {Math.abs(cplTrend).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MousePointer className="h-3 w-3" />
                  <span>CPC</span>
                </div>
                <div className="font-semibold text-sm">{formatCurrency(currentCPC || '0')}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon trend={cpcTrend} />
                  <span className={cpcTrend > 0 ? 'text-red-600' : cpcTrend < 0 ? 'text-green-600' : 'text-gray-500'}>
                    {Math.abs(cpcTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-2">
            <div className="text-xs text-gray-600">Recent History</div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {history.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {formatCTDate(entry.date, 'MMM dd')}
                    </span>
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {entry.dataSource}
                    </Badge>
                  </div>
                  <div className="flex gap-3 text-right">
                    <div>
                      <span className="text-gray-500">Spend:</span>
                      <span className="ml-1">{formatCurrency(entry.cost)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">CPL:</span>
                      <span className="ml-1">{formatCurrency(entry.costPerWebsiteLead)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">CPC:</span>
                      <span className="ml-1">{formatCurrency(entry.costPerLinkClick)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          {lastHistory?.syncedAt && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              Last synced: {formatCTDate(fromFirebaseTimestamp(lastHistory.syncedAt), 'MMM dd, HH:mm')}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default CostHistoryTooltip