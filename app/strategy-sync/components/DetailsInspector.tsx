'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  User, 
  Target, 
  FileText, 
  Edit3, 
  GitCompare, 
  ExternalLink,
  Grid3X3,
  MoreHorizontal
} from 'lucide-react'

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

interface Creative {
  id: string
  campaignId: string
  accountId: string
  waveId: string
  batchId: string
  assetUrl?: string
  attributes: {
    layout?: string
    template?: string
    headline?: string
    cta?: string
    tone?: string
    background?: string
    icons?: boolean
  }
  metrics: {
    spend: number
    leads: number
    cpl: number
    cpc: number
    ctr: number
    impressions: number
    uniques: number
  }
  uploadedAt: string
  status: 'draft' | 'active' | 'paused' | 'completed'
}

interface DetailsInspectorProps {
  selectedWave: Wave | null
  selectedCreative: string | null
  onCreativeSelect: (creativeId: string) => void
  onOpenCreativeLibrary: (creativeId: string) => void
}

// Mock creative data for demonstration
const mockCreatives: Creative[] = [
  {
    id: 'creative-1-1',
    campaignId: '1',
    accountId: '1',
    waveId: '1',
    batchId: 'batch-1',
    assetUrl: '/api/placeholder/300/200',
    attributes: {
      layout: 'Hero Image',
      template: 'Legal Lead Gen',
      headline: 'Were You Injured in an Accident?',
      cta: 'Get Free Case Review',
      tone: 'Professional',
      background: 'Gradient Blue',
      icons: true
    },
    metrics: {
      spend: 2580.50,
      leads: 78,
      cpl: 33.08,
      cpc: 2.15,
      ctr: 4.2,
      impressions: 31200,
      uniques: 8940
    },
    uploadedAt: '2024-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: 'creative-1-2',
    campaignId: '1',
    accountId: '1', 
    waveId: '1',
    batchId: 'batch-1',
    assetUrl: '/api/placeholder/300/200',
    attributes: {
      layout: 'Side Image',
      template: 'Legal Lead Gen',
      headline: 'Free Legal Consultation Available',
      cta: 'Contact Us Today',
      tone: 'Friendly',
      background: 'White',
      icons: false
    },
    metrics: {
      spend: 2240.80,
      leads: 65,
      cpl: 34.47,
      cpc: 2.08,
      ctr: 3.9,
      impressions: 28600,
      uniques: 7850
    },
    uploadedAt: '2024-01-15T10:00:00Z',
    status: 'active'
  }
]

// Mock user names
const getUserName = (userId: string): string => {
  const users: Record<string, string> = {
    'user-1': 'Sarah M.',
    'user-2': 'Mike K.',
    'user-3': 'Lisa R.'
  }
  return users[userId] || 'Unknown'
}

export default function DetailsInspector({ 
  selectedWave, 
  selectedCreative, 
  onCreativeSelect, 
  onOpenCreativeLibrary 
}: DetailsInspectorProps) {
  const [showAllMetrics, setShowAllMetrics] = useState(false)
  
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

  // Get creatives for the selected wave
  const waveCreatives = selectedWave 
    ? mockCreatives.filter(c => c.waveId === selectedWave.id)
    : []

  const selectedCreativeData = selectedCreative 
    ? waveCreatives.find(c => c.id === selectedCreative)
    : null

  if (!selectedWave) {
    return (
      <div className="h-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-[500] text-black font-['DM_Sans']">Details Inspector</h3>
        </div>
        
        <div className="px-4">
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-[500] text-gray-900 font-['DM_Sans'] mb-1">No Wave Selected</h4>
            <p className="text-xs text-gray-600 font-['DM_Sans']">
              Select a wave to view details here
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (selectedCreativeData) {
    // Creative Sub-Panel
    return (
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreativeSelect('')}
                className="p-1 h-auto"
              >
                ← Back
              </Button>
              <h3 className="text-lg font-[500] text-black font-['DM_Sans']">Creative Details</h3>
            </div>
          </div>
        </div>
        
        <div className="px-4 space-y-6">
          {/* Creative Preview */}
          <div>
            <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden mb-3">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                <span className="text-white font-[500] text-sm">Creative Preview</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-['DM_Sans']">
              <span>ID: {selectedCreativeData.id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenCreativeLibrary(selectedCreativeData.id)}
                className="h-6 px-2 text-xs gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Library
              </Button>
            </div>
          </div>

          {/* Attributes */}
          <div>
            <h4 className="text-sm font-[500] text-black font-['DM_Sans'] mb-3">Attributes</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-500 font-['DM_Sans']">Layout</div>
                <div className="text-black font-[500] font-['DM_Sans']">{selectedCreativeData.attributes.layout || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 font-['DM_Sans']">Template</div>
                <div className="text-black font-[500] font-['DM_Sans']">{selectedCreativeData.attributes.template || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500 font-['DM_Sans']">Headline</div>
                <div className="text-black font-[500] font-['DM_Sans']">{selectedCreativeData.attributes.headline || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 font-['DM_Sans']">CTA</div>
                <div className="text-black font-[500] font-['DM_Sans']">{selectedCreativeData.attributes.cta || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 font-['DM_Sans']">Tone</div>
                <div className="text-black font-[500] font-['DM_Sans']">{selectedCreativeData.attributes.tone || '-'}</div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h4 className="text-sm font-[500] text-black font-['DM_Sans'] mb-3">Performance Metrics</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-gray-500 mb-1 font-['DM_Sans']">Leads</div>
                  <div className="text-sm font-[500] text-black font-['DM_Sans']">{formatNumber(selectedCreativeData.metrics.leads)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 mb-1 font-['DM_Sans']">CPL</div>
                  <div className="text-sm font-[500] text-black font-['DM_Sans']">{formatCurrency(selectedCreativeData.metrics.cpl)}</div>
                </div>
                
                {showAllMetrics && (
                  <>
                    <div className="text-center">
                      <div className="text-gray-500 mb-1 font-['DM_Sans']">CPC</div>
                      <div className="text-sm font-[500] text-black font-['DM_Sans']">{formatCurrency(selectedCreativeData.metrics.cpc)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 mb-1 font-['DM_Sans']">CTR</div>
                      <div className="text-sm font-[500] text-black font-['DM_Sans']">{selectedCreativeData.metrics.ctr}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 mb-1 font-['DM_Sans']">Impressions</div>
                      <div className="text-sm font-[500] text-black font-['DM_Sans']">{formatNumber(selectedCreativeData.metrics.impressions)}</div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-center mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllMetrics(!showAllMetrics)}
                  className="h-6 px-2 text-xs font-['DM_Sans']"
                >
                  {showAllMetrics ? 'Show less' : 'Show more metrics'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Wave Details Panel (default)
  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-[500] text-black font-['DM_Sans']">Wave {selectedWave.waveNumber} Details</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-['DM_Sans'] mt-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(selectedWave.createdAt)}</span>
        </div>
      </div>
      
      <div className="px-4 space-y-6">
        {/* Wave Summary Section */}
        <div>
          <h4 className="text-sm font-[500] text-black font-['DM_Sans'] mb-3">Wave Summary</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-['DM_Sans']">Uploaders</span>
              </div>
              <p className="text-sm text-black font-['DM_Sans']">{selectedWave.uploaderIds.map(getUserName).join(', ')}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-['DM_Sans']">Test Focus</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedWave.testFocus.map((focus) => (
                  <div key={focus} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-[500] font-['DM_Sans'] rounded-full">
                    {focus}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 font-['DM_Sans'] mb-1">Change Description</div>
              <p className="text-sm text-black font-['DM_Sans']">{selectedWave.changeDescription}</p>
            </div>
          </div>
          
          {/* Wave Metrics */}
          <div className="mt-4">
            <h5 className="text-xs text-gray-500 font-['DM_Sans'] mb-2">Performance Metrics</h5>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-gray-500 mb-1 font-['DM_Sans']">Spend</div>
                  <div className="text-sm font-[500] text-black font-['DM_Sans']">{formatCurrency(selectedWave.metrics.spend)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 mb-1 font-['DM_Sans']">Leads</div>
                  <div className="text-sm font-[500] text-black font-['DM_Sans']">{formatNumber(selectedWave.metrics.leads)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 mb-1 font-['DM_Sans']">CPL</div>
                  <div className="text-sm font-[500] text-black font-['DM_Sans']">{formatCurrency(selectedWave.metrics.cpl)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" size="sm" className="flex-1 gap-2 font-['DM_Sans'] text-xs">
              <GitCompare className="h-3 w-3" />
              Compare
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 font-['DM_Sans'] text-xs">
              <Grid3X3 className="h-3 w-3" />
              Open Creatives
            </Button>
          </div>
        </div>

        {/* Creatives Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-[500] text-black font-['DM_Sans']">Creatives ({waveCreatives.length})</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {waveCreatives.map((creative) => (
              <div 
                key={creative.id}
                className="bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onCreativeSelect(creative.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-[4/3] bg-gray-200 rounded mb-2 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-white font-[500] text-[10px]">IMG</span>
                  </div>
                </div>
                
                {/* Creative Info */}
                <div className="text-xs">
                  <div className="text-gray-500 font-['DM_Sans'] mb-1">ID: {creative.id.slice(-3)}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-gray-500 font-['DM_Sans']">Leads</div>
                      <div className="text-black font-[500] font-['DM_Sans']">{formatNumber(creative.metrics.leads)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-['DM_Sans']">CPL</div>
                      <div className="text-black font-[500] font-['DM_Sans']">{formatCurrency(creative.metrics.cpl)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <h4 className="text-sm font-[500] text-black font-['DM_Sans'] mb-3">Notes</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-['DM_Sans']">Test Notes</span>
              </div>
              <p className="text-sm text-gray-600 font-['DM_Sans']">
                {selectedWave.testNotes || 'No test notes provided'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Edit3 className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-['DM_Sans']">Result Notes</span>
              </div>
              <p className="text-sm text-gray-600 font-['DM_Sans']">
                {selectedWave.resultNotes || (
                  <span className="text-gray-400 italic">Awaiting data...</span>
                )}
              </p>
              
              <Button variant="ghost" size="sm" className="mt-2 gap-2 font-['DM_Sans'] text-xs">
                <Edit3 className="h-3 w-3" />
                {selectedWave.resultNotes ? 'Edit Notes' : 'Add Notes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}