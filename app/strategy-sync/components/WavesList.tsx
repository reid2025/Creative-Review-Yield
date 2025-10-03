'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Eye, GitCompare, Edit3, Calendar, User, Target, FileText, ChevronDown } from 'lucide-react'

interface Wave {
  id: string
  campaignId: string
  waveNumber: number
  batchId: string
  createdAt: string
  uploaderIds: string[]
  testNotes?: string
  testFocus: string[]
  changeDescription: string
  resultNotes?: string
  metrics: {
    spend: number
    leads: number
    cpl: number
    cpc: number
    ctr: number
    uniques: number
    impressions: number
  }
  creativesCount: number
}

interface WavesListProps {
  waves: Wave[]
  selectedWave: Wave | null
  selectedWaves: Wave[]
  onWaveSelect: (wave: Wave) => void
  onWaveCompare: (wave: Wave) => void
}

// Mock user names for display
const getUserName = (userId: string): string => {
  const users: Record<string, string> = {
    'user-1': 'Sarah M.',
    'user-2': 'Mike K.',
    'user-3': 'Lisa R.'
  }
  return users[userId] || 'Unknown'
}

export default function WavesList({ waves, selectedWave, selectedWaves, onWaveSelect, onWaveCompare }: WavesListProps) {
  // Mock thumbnail data for demonstration
  const getWaveThumbnails = (waveId: string) => {
    // In real implementation, this would fetch actual creative thumbnails
    return [
      { id: `${waveId}-thumb-1`, url: '/api/placeholder/60/45', alt: 'Creative 1' },
      { id: `${waveId}-thumb-2`, url: '/api/placeholder/60/45', alt: 'Creative 2' },
      { id: `${waveId}-thumb-3`, url: '/api/placeholder/60/45', alt: 'Creative 3' }
    ]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const isWaveSelected = (wave: Wave) => {
    return selectedWave?.id === wave.id
  }

  const isWaveInComparison = (wave: Wave) => {
    return selectedWaves.find(w => w.id === wave.id) !== undefined
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-[500] text-black font-['DM_Sans']">Waves Timeline</h3>
      
      {waves.map((wave) => {
        const thumbnails = getWaveThumbnails(wave.id)
        const displayThumbs = thumbnails.slice(0, 3)
        const remainingCount = Math.max(0, wave.creativesCount - 3)
        
        return (
          <div 
            key={wave.id} 
            className={`bg-white rounded-lg border transition-all duration-200 cursor-pointer ${
              isWaveSelected(wave) ? 'ring-2 ring-blue-500 shadow-sm bg-blue-50' : 'hover:shadow-sm hover:bg-gray-50'
            }`}
            onClick={() => onWaveSelect(wave)}
          >
            <div className="p-4">
              {/* Collapsed Row Content */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Wave Info */}
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-base font-[500] text-black font-['DM_Sans']">Wave {wave.waveNumber}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-['DM_Sans'] mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(wave.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Previews */}
                  <div className="flex items-center gap-2">
                    {displayThumbs.map((thumb, index) => (
                      <div 
                        key={thumb.id}
                        className="w-12 h-9 bg-gray-200 rounded border flex-shrink-0 overflow-hidden"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-[8px] text-white font-[500]">IMG</span>
                        </div>
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <div className="w-12 h-9 bg-gray-100 rounded border flex-shrink-0 flex items-center justify-center">
                        <span className="text-[10px] text-gray-600 font-[500] font-['DM_Sans']">+{remainingCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Test Focus Pills (max 2) */}
                  <div className="flex items-center gap-1.5">
                    {wave.testFocus.slice(0, 2).map((focus) => (
                      <div key={focus} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-[500] font-['DM_Sans'] rounded-full whitespace-nowrap">
                        {focus}
                      </div>
                    ))}
                    {wave.testFocus.length > 2 && (
                      <div className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-[500] font-['DM_Sans'] rounded-full">
                        +{wave.testFocus.length - 2}
                      </div>
                    )}
                  </div>

                  {/* Hero Metrics - Only Leads and CPL */}
                  <div className="flex items-center gap-3 text-sm font-['DM_Sans'] ml-auto">
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">Leads</div>
                      <div className="font-[500] text-black">{formatNumber(wave.metrics.leads)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">CPL</div>
                      <div className="font-[500] text-black">{formatCurrency(wave.metrics.cpl)}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onWaveSelect(wave)}
                    className="h-8 px-3 text-gray-600 hover:text-black font-['DM_Sans'] text-xs"
                  >
                    View Creatives
                  </Button>
                  
                  <Button
                    variant={isWaveInComparison(wave) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onWaveCompare(wave)}
                    disabled={selectedWaves.length >= 2 && !isWaveInComparison(wave)}
                    className="h-8 px-3 font-['DM_Sans'] text-xs"
                  >
                    Compare
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {waves.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-[500] text-gray-900 font-['DM_Sans'] mb-2">No Waves Found</h3>
          <p className="text-gray-600 font-['DM_Sans']">
            No waves match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  )
}