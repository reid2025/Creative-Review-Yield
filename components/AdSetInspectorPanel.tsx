'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, ArrowUpRight, Edit3, Eye, TrendingUp, TrendingDown, List, Grid3X3, BarChart3, ArrowUp, ArrowDown, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageHoverPreview } from '@/components/ImageHoverPreview'
import { AdSet, AdSetCreative, getCreativeStatuses } from '@/lib/ad-set-utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { db } from '@/lib/firebase'
import { collection, getDocs, query } from 'firebase/firestore'

interface AdSetInspectorPanelProps {
  adSet: AdSet | null
  isOpen: boolean
  onClose: () => void
  onOpenInLibrary?: (creative: AdSetCreative) => void
  onEditAttributes?: (creative: AdSetCreative) => void
}

export function AdSetInspectorPanel({
  adSet,
  isOpen,
  onClose,
  onOpenInLibrary,
  onEditAttributes
}: AdSetInspectorPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [lightboxImage, setLightboxImage] = useState<{imageUrl: string, filename: string} | null>(null)
  const router = useRouter()

  // Function to find creative ID in Firebase (same logic as Creative Stream)
  const findCreativeIdInFirebase = async (creative: any): Promise<string | null> => {
    try {
      const creativesRef = collection(db, 'creatives')
      const snapshot = await getDocs(query(creativesRef))
      
      let creativeId: string | null = null
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.creativeFilename === creative.imageAssetName || 
            data.imageUrl === creative.imageUrl ||
            data.formData?.creativeFilename === creative.imageAssetName) {
          creativeId = doc.id
        }
      })
      
      return creativeId
    } catch (error) {
      console.error('Error finding creative for edit:', error)
      toast.error('Could not find creative for editing')
      return null
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Panel - 55% width */}
      <div className={`fixed right-0 top-0 h-full w-[55%] min-w-[600px] max-w-[700px] bg-white shadow-xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ zIndex: 9998 }}>
        {adSet && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-['DM_Sans'] font-medium text-black mb-1">
                    Ad Set — {adSet.campaignName}
                  </h2>
                  <p className="text-xs text-gray-500 font-['DM_Sans'] font-normal">
                    {adSet.accountName} • Launched: {adSet.firstSeenCT}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Status counters */}
              <div className="flex flex-wrap gap-3 text-xs font-['DM_Sans']">
                <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full">
                  <span className="font-semibold text-black">{adSet.totalCreatives}</span> Total
                </span>
                <span className="bg-gray-100 border border-green-200 text-gray-700 px-3 py-1.5 rounded-full">
                  <span className="font-semibold text-green-700">{adSet.activeCount}</span> Active
                </span>
                <span className="bg-gray-100 border border-orange-200 text-gray-700 px-3 py-1.5 rounded-full">
                  <span className="font-semibold text-orange-700">{adSet.pausedCount}</span> Paused
                </span>
                <span className="bg-gray-100 border border-yellow-200 text-gray-700 px-3 py-1.5 rounded-full">
                  <span className="font-semibold text-yellow-700">{adSet.draftCount}</span> Draft
                </span>
                <span className="bg-gray-100 border border-blue-200 text-gray-700 px-3 py-1.5 rounded-full">
                  <span className="font-semibold text-blue-700">{adSet.savedCount}</span> Saved
                </span>
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 flex-shrink-0">
                <div className="w-full h-12 bg-transparent border-0 rounded-none p-0 grid grid-cols-3">
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`h-12 rounded-none border-b-2 font-['DM_Sans'] font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      activeTab === 'list' 
                        ? 'border-black text-black font-semibold' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>
                  <button
                    onClick={() => setActiveTab('grid')}
                    className={`h-12 rounded-none border-b-2 font-['DM_Sans'] font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      activeTab === 'grid' 
                        ? 'border-black text-black font-semibold' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => setActiveTab('performance')}
                    className={`h-12 rounded-none border-b-2 font-['DM_Sans'] font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      activeTab === 'performance' 
                        ? 'border-black text-black font-semibold' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Performance
                  </button>
                </div>
              </div>
              
              {/* Tab Content - Scrollable */}
              <div className="flex-1 min-h-0">
                {activeTab === 'list' && (
                  <ListViewContent 
                    adSet={adSet} 
                    onOpenInLibrary={onOpenInLibrary}
                    onEditAttributes={onEditAttributes}
                    onEditCreativeWithId={findCreativeIdInFirebase}
                    router={router}
                  />
                )}
                {activeTab === 'grid' && (
                  <GridViewContent 
                    adSet={adSet} 
                    onOpenInLibrary={onOpenInLibrary}
                    onEditAttributes={onEditAttributes}
                    onEditCreativeWithId={findCreativeIdInFirebase}
                    router={router}
                  />
                )}
                {activeTab === 'performance' && (
                  <PerformanceViewContent 
                    adSet={adSet} 
                    setLightboxImage={setLightboxImage}
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500 font-['DM_Sans']">
                <span>First Seen (CT): {adSet.firstSeenCT}</span>
                <span>Last Updated (CT): {adSet.lastUpdatedCT}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg font-semibold">
              {lightboxImage?.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 flex items-center justify-center max-h-[80vh] overflow-auto">
            {lightboxImage && (
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.filename}
                className="max-w-full max-h-full object-contain"
                style={{ 
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                  maxHeight: 'calc(80vh - 120px)' 
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// List View Component
function ListViewContent({ 
  adSet, 
  onOpenInLibrary, 
  onEditAttributes,
  onEditCreativeWithId,
  router
}: { 
  adSet: AdSet
  onOpenInLibrary?: (creative: AdSetCreative) => void
  onEditAttributes?: (creative: AdSetCreative) => void
  onEditCreativeWithId: (creative: any) => Promise<string | null>
  router: any
}) {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-6 space-y-4">
        {adSet.creatives.map((adSetCreative) => (
          <ListCreativeCard
            key={adSetCreative.creativeKey}
            adSetCreative={adSetCreative}
            onOpenInLibrary={onOpenInLibrary}
            onEditAttributes={onEditAttributes}
            onEditCreativeWithId={onEditCreativeWithId}
            router={router}
          />
        ))}
      </div>
    </div>
  )
}

// List Creative Card Component
function ListCreativeCard({ 
  adSetCreative, 
  onOpenInLibrary, 
  onEditAttributes,
  onEditCreativeWithId,
  router
}: {
  adSetCreative: AdSetCreative
  onOpenInLibrary?: (creative: AdSetCreative) => void
  onEditAttributes?: (creative: AdSetCreative) => void
  onEditCreativeWithId: (creative: any) => Promise<string | null>
  router: any
}) {
  const { creative, cpl, cpc, leads } = adSetCreative
  const statuses = getCreativeStatuses(creative)
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    onEditAttributes?.(adSetCreative)
  }

  const handleEyeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Store the latest Google Sheets data in sessionStorage (same as Creative Stream)
    sessionStorage.setItem('googleSheetCreative', JSON.stringify({
      imageUrl: creative.imageUrl,
      imageAssetName: creative.imageAssetName,
      accountName: creative.accountName,
      campaignName: creative.campaignName,
      litigationName: creative.litigationName,
      history: creative.history
    }))
    
    if (creative.savedInLibrary) {
      const creativeId = await onEditCreativeWithId(creative)
      
      if (creativeId) {
        // Redirect to creative-details page for editing
        router.push(`/google-sheets-records/creative-details?edit=${creativeId}&from=google-sheets`)
        return
      }
    }
    
    // Redirect to creative-details page for new creative
    router.push('/google-sheets-records/creative-details?from=google-sheets')
  }

  return (
    <div 
      className="bg-white border border-[#E6E6E6] hover:border-black hover:shadow-sm rounded-xl p-3 cursor-pointer transition-all duration-160 box-border"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Edit creative ${creative.imageAssetName}`}
    >
      <div className="flex items-center gap-3">
        {/* Eye Column - appears on hover */}
        <div className={`flex items-center justify-center transition-all duration-160 ease-out ${
          isHovered 
            ? 'w-6 opacity-100' 
            : 'w-0 opacity-0'
        } overflow-hidden`}>
          <button
            onClick={handleEyeClick}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Edit Creative"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Thumbnail - Fixed 80x80px (5rem) */}
        <div className="flex-shrink-0">
          {creative.imageUrl ? (
            <ImageHoverPreview
              src={creative.imageUrl}
              alt={creative.imageAssetName}
              className="w-20 h-20 object-cover rounded border hover:border-blue-500 cursor-pointer transition-colors"
              previewSize={{ width: 300, height: 300 }}
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
        </div>

        {/* Content Column */}
        <div 
          className={`flex-1 min-w-0 transition-transform duration-160 ease-out ${
            isHovered ? 'transform translate-x-2' : ''
          }`}
        >
          {/* Filename */}
          <div className="text-sm font-medium text-gray-900 truncate mb-1">
            {creative.imageAssetName || 'Unnamed Creative'}
          </div>
          
          {/* Metrics & Tags in one row */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-600">
              CPL: ${cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | CPC: ${cpc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Leads: {leads.toFixed(0)}
            </span>
            
            {/* Status badges */}
            <div className="flex items-center gap-1">
              {statuses.delivery !== 'Unknown' && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  statuses.delivery === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : statuses.delivery === 'Paused'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {statuses.delivery}
                </span>
              )}
              
              {statuses.workflow !== 'None' && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  statuses.workflow === 'Saved' 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {statuses.workflow}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Grid View Component
function GridViewContent({ 
  adSet, 
  onOpenInLibrary, 
  onEditAttributes,
  onEditCreativeWithId,
  router
}: { 
  adSet: AdSet
  onOpenInLibrary?: (creative: AdSetCreative) => void
  onEditAttributes?: (creative: AdSetCreative) => void
  onEditCreativeWithId: (creative: any) => Promise<string | null>
  router: any
}) {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {adSet.creatives.map((adSetCreative) => (
            <GridCreativeCard
              key={adSetCreative.creativeKey}
              adSetCreative={adSetCreative}
              onOpenInLibrary={onOpenInLibrary}
              onEditAttributes={onEditAttributes}
              onEditCreativeWithId={onEditCreativeWithId}
              router={router}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Grid Creative Card Component
function GridCreativeCard({ 
  adSetCreative, 
  onOpenInLibrary, 
  onEditAttributes,
  onEditCreativeWithId,
  router
}: {
  adSetCreative: AdSetCreative
  onOpenInLibrary?: (creative: AdSetCreative) => void
  onEditAttributes?: (creative: AdSetCreative) => void
  onEditCreativeWithId: (creative: any) => Promise<string | null>
  router: any
}) {
  const { creative, cpl, cpc, leads } = adSetCreative
  const statuses = getCreativeStatuses(creative)
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    onEditAttributes?.(adSetCreative)
  }

  const handleEyeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Store the latest Google Sheets data in sessionStorage (same as Creative Stream)
    sessionStorage.setItem('googleSheetCreative', JSON.stringify({
      imageUrl: creative.imageUrl,
      imageAssetName: creative.imageAssetName,
      accountName: creative.accountName,
      campaignName: creative.campaignName,
      litigationName: creative.litigationName,
      history: creative.history
    }))
    
    if (creative.savedInLibrary) {
      const creativeId = await onEditCreativeWithId(creative)
      
      if (creativeId) {
        // Redirect to creative-details page for editing
        router.push(`/google-sheets-records/creative-details?edit=${creativeId}&from=google-sheets`)
        return
      }
    }
    
    // Redirect to creative-details page for new creative
    router.push('/google-sheets-records/creative-details?from=google-sheets')
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-400 transition-all duration-200 group"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail - 1:1 aspect ratio with hover overlay */}
      <div className="aspect-square relative">
        {creative.imageUrl ? (
          <ImageHoverPreview
            src={creative.imageUrl}
            alt={creative.imageAssetName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Eye Icon Overlay - appears on hover */}
        <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleEyeClick}
            className="p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
            title="Edit Creative"
          >
            <Eye className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Filename - bold and slightly larger */}
        <h4 className="text-sm font-['DM_Sans'] font-bold text-black mb-2 truncate leading-tight">
          {creative.imageAssetName || 'Unnamed Creative'}
        </h4>
        
        {/* Metrics - smaller, secondary */}
        <div className="text-xs text-gray-500 font-['DM_Sans'] mb-3">
          CPL: ${cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-gray-300">|</span> CPC: ${cpc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-gray-300">|</span> Leads: {leads.toFixed(0)}
        </div>
        
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge 
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              statuses.delivery === 'Active' 
                ? 'bg-green-500 text-white' 
                : statuses.delivery === 'Paused'
                ? 'bg-orange-500 text-white'
                : statuses.delivery === 'Inactive'
                ? 'bg-gray-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {statuses.delivery}
          </Badge>
          
          {statuses.workflow !== 'None' && (
            <Badge 
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                statuses.workflow === 'Saved' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {statuses.workflow}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

// Performance View Component  
function PerformanceViewContent({ 
  adSet, 
  setLightboxImage 
}: { 
  adSet: AdSet
  setLightboxImage: (image: {imageUrl: string, filename: string} | null) => void
}) {
  const [selectedMetric, setSelectedMetric] = useState('spend')
  
  // Calculate summary metrics - CORRECTED FORMULAS
  const totalSpend = adSet.creatives.reduce((sum, creative) => {
    const creativeTotal = creative.creative.history.reduce((s, h) => s + parseFloat(h.cost || '0'), 0)
    return sum + creativeTotal
  }, 0)

  // Calculate total leads and clicks across all creatives
  const { totalLeads, totalClicks } = adSet.creatives.reduce((acc, creative) => {
    creative.creative.history.forEach(entry => {
      const cost = parseFloat(entry.cost || '0')
      const costPerLead = parseFloat(entry.costPerWebsiteLead || '0')
      const costPerClick = parseFloat(entry.costPerLinkClick || '0')
      
      acc.totalLeads += costPerLead > 0 ? cost / costPerLead : 0
      acc.totalClicks += costPerClick > 0 ? cost / costPerClick : 0
    })
    return acc
  }, { totalLeads: 0, totalClicks: 0 })

  // Weighted averages
  const avgCPL = totalLeads > 0 ? totalSpend / totalLeads : 0
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0

  // Mock CTR calculation (replace with actual data when available)
  const avgCTR = 2.4

  // Calculate performance data aggregated by date using real Google Sheets data
  const performanceData = useMemo(() => {
    // Group all history entries by date and aggregate
    const dateMap = new Map()
    
    adSet.creatives.forEach(creative => {
      creative.creative.history.forEach(entry => {
        const date = entry.date.split('T')[0] // Get YYYY-MM-DD from ISO string
        
        const cost = parseFloat(entry.cost || '0')
        const costPerLead = parseFloat(entry.costPerWebsiteLead || '0')
        const costPerClick = parseFloat(entry.costPerLinkClick || '0')
        
        // Derive leads and clicks from cost and per-unit costs
        const leads = costPerLead > 0 ? cost / costPerLead : 0
        const clicks = costPerClick > 0 ? cost / costPerClick : 0
        
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            date,
            spend: 0,
            leads: 0,
            clicks: 0,
            creativeCount: 0
          })
        }
        
        const dayData = dateMap.get(date)
        dayData.spend += cost
        dayData.leads += leads
        dayData.clicks += clicks
        dayData.creativeCount += 1
      })
    })
    
    // Convert to array and calculate weighted averages
    const dailyData = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(day => ({
        ...day,
        // Weighted averages based on daily totals
        cpl: day.leads > 0 ? day.spend / day.leads : 0,
        cpc: day.clicks > 0 ? day.spend / day.clicks : 0,
        dateFormatted: new Date(day.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
    
    return dailyData
  }, [adSet.creatives])

  // Calculate spotlight data using real Google Sheets data
  const spotlightData = useMemo(() => {
    // Calculate totals for each creative across all history
    const creativesWithTotals = adSet.creatives.map(creative => {
      let totalSpend = 0
      let totalLeads = 0
      let totalClicks = 0
      
      creative.creative.history.forEach(entry => {
        const cost = parseFloat(entry.cost || '0')
        const costPerLead = parseFloat(entry.costPerWebsiteLead || '0')
        const costPerClick = parseFloat(entry.costPerLinkClick || '0')
        
        totalSpend += cost
        totalLeads += costPerLead > 0 ? cost / costPerLead : 0
        totalClicks += costPerClick > 0 ? cost / costPerClick : 0
      })
      
      return {
        ...creative,
        totalSpend,
        totalLeads,
        totalClicks,
        avgCpl: totalLeads > 0 ? totalSpend / totalLeads : Infinity
      }
    })

    const results = []

    // Top Performer (Lowest CPL)
    const topPerformer = creativesWithTotals
      .filter(c => c.totalLeads > 0)
      .reduce((best, current) => 
        current.avgCpl < best.avgCpl ? current : best
      )
    
    if (topPerformer) {
      results.push({
        type: 'top-performer',
        badge: 'Top Performer',
        kpi: `CPL: $${topPerformer.avgCpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        creative: topPerformer
      })
    }

    // Highest Spender
    const highestSpender = creativesWithTotals.reduce((highest, current) => 
      current.totalSpend > highest.totalSpend ? current : highest
    )
    results.push({
      type: 'highest-spender',
      badge: 'Highest Spend',
      kpi: `Spend: $${highestSpender.totalSpend.toLocaleString()}`,
      creative: highestSpender
    })

    // Most Leads
    const mostLeads = creativesWithTotals.reduce((most, current) => 
      current.totalLeads > most.totalLeads ? current : most
    )
    results.push({
      type: 'most-leads',
      badge: 'Most Leads',
      kpi: `Leads: ${Math.round(mostLeads.totalLeads)}`,
      creative: mostLeads
    })

    // Most Clicks
    const mostClicks = creativesWithTotals.reduce((most, current) => 
      current.totalClicks > most.totalClicks ? current : most
    )
    results.push({
      type: 'most-clicks',
      badge: 'Most Clicks',
      kpi: `Clicks: ${Math.round(mostClicks.totalClicks)}`,
      creative: mostClicks
    })

    return results
  }, [adSet.creatives])

  // Metric toggles for line chart
  const [activeMetrics, setActiveMetrics] = useState(['spend', 'leads'])

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-6 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Spend */}
          <div className="bg-white p-4 rounded-lg border border-[#E6E6E6] shadow-sm">
            <div className="text-sm font-['DM_Sans'] font-medium text-gray-600 mb-1">Total Spend</div>
            <div className="text-2xl font-['DM_Sans'] font-bold text-black mb-2">${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
            </div>
          </div>
          
          {/* Avg CPL */}
          <div className="bg-white p-4 rounded-lg border border-[#E6E6E6] shadow-sm">
            <div className="text-sm font-['DM_Sans'] font-medium text-gray-600 mb-1">Avg. CPL</div>
            <div className="text-2xl font-['DM_Sans'] font-bold text-black mb-2">${avgCPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-50 text-xs">
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              <span className="text-red-600 font-medium">-8.3%</span>
            </div>
          </div>
          
          {/* Avg CPC */}
          <div className="bg-white p-4 rounded-lg border border-[#E6E6E6] shadow-sm">
            <div className="text-sm font-['DM_Sans'] font-medium text-gray-600 mb-1">Avg. CPC</div>
            <div className="text-2xl font-['DM_Sans'] font-bold text-black mb-2">${avgCPC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+5.2%</span>
            </div>
          </div>
        </div>

        {/* Spotlight Row */}
        {spotlightData.length > 0 && (
          <div className="space-y-3">
            <div className="mb-3 pb-3 border-b border-gray-200">
              <h3 className="text-lg font-['DM_Sans'] font-semibold text-black">Spotlight</h3>
              <p className="text-sm text-gray-600 font-['DM_Sans'] mt-1 mb-1">
                Top performing creatives in this ad set
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 auto-rows-fr" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              {spotlightData.map((spotlight) => (
                <SpotlightCard
                  key={spotlight.type}
                  spotlight={spotlight}
                  onClick={() => {
                    console.log('Opening creative details for:', spotlight.creative.creative.imageAssetName)
                    // TODO: Open creative detail drawer
                  }}
                  onImageClick={(imageUrl, filename) => {
                    setLightboxImage({ imageUrl, filename })
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Performance Trends Chart */}
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          {/* Card Header with Title Only */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <h3 className="text-lg font-['DM_Sans'] font-semibold text-black">Performance Trends</h3>
            <p className="text-sm text-gray-600 font-['DM_Sans'] mt-1 mb-1">
              Daily aggregated metrics across all creatives in this ad set
            </p>
          </div>
          {performanceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateFormatted" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickFormatter={(value) => Math.round(value).toString()}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => {
                      if (name === 'spend') return [`$${Number(value).toLocaleString()}`, 'Spend']
                      if (name === 'leads') return [`${Math.round(Number(value))}`, 'Leads']
                      if (name === 'clicks') return [`${Math.round(Number(value))}`, 'Clicks']
                      if (name === 'cpl') return [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'CPL']
                      if (name === 'cpc') return [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'CPC']
                      return [value, name]
                    }}
                  />
                  {activeMetrics.includes('spend') && (
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="spend" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {activeMetrics.includes('leads') && (
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="leads" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {activeMetrics.includes('clicks') && (
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {activeMetrics.includes('cpl') && (
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cpl" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {activeMetrics.includes('cpc') && (
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cpc" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-sm mb-1">No performance data available</div>
                <div className="text-xs">Data will appear when performance history is recorded</div>
              </div>
            </div>
          )}
          
          {/* Metric Chips Below Chart */}
          <div className="flex justify-center flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
            {[
              { key: 'spend', label: 'Spend', color: '#3b82f6' },
              { key: 'leads', label: 'Leads', color: '#10b981' },
              { key: 'clicks', label: 'Clicks', color: '#f59e0b' },
              { key: 'cpl', label: 'CPL', color: '#8b5cf6' },
              { key: 'cpc', label: 'CPC', color: '#ef4444' }
            ].map((metric) => {
              const isActive = activeMetrics.includes(metric.key)
              return (
                <button
                  key={metric.key}
                  onClick={() => {
                    if (activeMetrics.includes(metric.key)) {
                      setActiveMetrics(prev => prev.filter(m => m !== metric.key))
                    } else {
                      setActiveMetrics(prev => [...prev, metric.key])
                    }
                  }}
                  aria-pressed={isActive}
                  className={`
                    relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-['DM_Sans'] font-semibold transition-all duration-200
                    ${isActive 
                      ? 'border text-black' 
                      : 'border border-gray-200 text-gray-600 opacity-60 hover:opacity-100'
                    }
                  `}
                  style={{
                    fontSize: '13px',
                    height: '32px',
                    borderColor: isActive ? metric.color : undefined,
                    backgroundColor: isActive ? `color-mix(in srgb, ${metric.color} 8%, #fff)` : '#fff'
                  }}
                >
                  <span
                    role="presentation"
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                  {metric.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Leads Per Day Chart */}
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-['DM_Sans'] font-semibold text-black">Leads per Day</h3>
              <div className="text-sm text-gray-500">
                Total Leads: {performanceData.reduce((sum, day) => sum + day.leads, 0)}
              </div>
            </div>
            <p className="text-sm text-gray-600 font-['DM_Sans'] mb-1">
              Combined daily leads generated by all creatives in this ad set
            </p>
          </div>
          {performanceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateFormatted"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [`${value}`, 'Leads']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="leads" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-sm mb-1">No leads data available</div>
                <div className="text-xs">Data will appear when leads are recorded</div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Thumbnail Strip */}
        <div className="bg-white p-4 rounded-lg border border-[#E6E6E6]">
          <h3 className="text-base font-['DM_Sans'] font-semibold text-black mb-4">Creative Previews</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {adSet.creatives.slice(0, 8).map((creative) => (
              <div 
                key={creative.creativeKey} 
                className="relative group cursor-pointer"
                onClick={() => {
                  // Open full preview modal when clicked
                  console.log('Open preview for:', creative.creative.imageAssetName)
                }}
              >
                <div 
                  className="aspect-square max-h-[120px] rounded-lg overflow-hidden border border-gray-200 group-hover:border-gray-400 transition-colors"
                  style={{ maxHeight: '120px' }}
                >
                  {creative.creative.imageUrl ? (
                    <img
                      src={creative.creative.imageUrl}
                      alt={creative.creative.imageAssetName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {adSet.creatives.length > 8 && (
              <div className="aspect-square max-h-[120px] rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium text-center px-2">
                  +{adSet.creatives.length - 8} more
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Spotlight Card Component
function SpotlightCard({ 
  spotlight, 
  onClick,
  onImageClick
}: {
  spotlight: {
    type: string
    badge: string
    kpi: string
    creative: any
    trend?: 'up' | 'down'
  }
  onClick: () => void
  onImageClick: (imageUrl: string, filename: string) => void
}) {
  const [hoveredImage, setHoveredImage] = useState<{ url: string; x: number; y: number } | null>(null)

  const handleClick = () => {
    onClick()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onImageClick(
      spotlight.creative.creative.imageUrl || '/placeholder-image.png',
      spotlight.creative.creative.imageAssetName || 'Unnamed Creative'
    )
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    console.log('Spotlight hover preview triggered:', {
      url: spotlight.creative.creative.imageUrl,
      rect: { x: rect.left, y: rect.top }
    })
    setHoveredImage({
      url: spotlight.creative.creative.imageUrl || '/placeholder-image.png',
      x: rect.left,
      y: rect.top
    })
  }
  
  const handleMouseLeave = () => {
    console.log('Spotlight hover preview dismissed')
    setHoveredImage(null)
  }

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'top-performer':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'highest-spender':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'most-leads':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'most-clicks':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getBadgeIcon = () => {
    if (spotlight.type === 'momentum') {
      return spotlight.trend === 'up' ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )
    }
    return null
  }

  const ariaLabel = `${spotlight.creative.creative.imageAssetName} – ${spotlight.badge}`

  return (
    <>
      <article
        role="article"
        tabIndex={0}
        aria-label={`${spotlight.badge} — ${spotlight.kpi}`}
        className="rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 bg-white w-full p-4"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        title={spotlight.creative.creative.imageAssetName || 'Unnamed Creative'}
      >
        {/* Horizontal Layout: Thumbnail (left) + Content (right) */}
        <div className="flex items-center gap-4">
          {/* Col A: Thumbnail */}
          <div 
            className="w-20 h-20 bg-[#F6F7F9] flex items-center justify-center overflow-hidden rounded-md border border-gray-200/50 cursor-zoom-in flex-shrink-0"
            onClick={handleImageClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={spotlight.creative.creative.imageUrl || '/placeholder-image.png'}
              alt={`${spotlight.creative.creative.imageAssetName} thumbnail`}
              className="max-w-full max-h-full object-contain"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
            />
          </div>

          {/* Col B: Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Row 1: Badge (left-aligned) */}
            <div className="flex justify-start">
              <span className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold font-['DM_Sans'] whitespace-nowrap
                ${getBadgeStyles(spotlight.type)}
              `}
              aria-label={spotlight.badge}>
                {getBadgeIcon()}
                {spotlight.badge}
              </span>
            </div>
            
            {/* Row 2: Metric (primary emphasis) */}
            <div className="text-base font-semibold text-gray-900 font-['DM_Sans'] tabular-nums leading-tight">
              {spotlight.kpi}
            </div>
          </div>
        </div>
      </article>

      {/* Floating Image Preview */}
      {hoveredImage && (
        <div 
          className="fixed pointer-events-none"
          style={{
            left: `${Math.min(hoveredImage.x + 100, window.innerWidth - 320 - 20)}px`,
            top: `${Math.min(hoveredImage.y, window.innerHeight - 320 - 20)}px`,
            zIndex: 99999
          }}
        >
          <div className="bg-white p-3 rounded-lg shadow-2xl border-2 border-gray-300 ring-1 ring-black/5">
            <img
              src={hoveredImage.url}
              alt="Preview"
              className="object-contain block"
              style={{
                maxWidth: '300px',
                maxHeight: '300px',
                minWidth: '200px',
                minHeight: '200px'
              }}
              onError={() => {
                setHoveredImage(null)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}