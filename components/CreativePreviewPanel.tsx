'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, Calendar, DollarSign, Target, MousePointer, Hash, List, BarChart3, Eye, ChevronDown, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ImageHoverPreview } from '@/components/ImageHoverPreview'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Import types from creative stream
interface GroupedCreative {
  uniqueKey: string
  imageAssetId: string
  imageAssetName: string
  imageUrl?: string
  litigationName?: string
  campaignType?: string
  accountName: string
  campaignName: string
  campaignStatus: string
  adSets: Array<{
    adSetId: string
    adId: string
    adCreativeId: string
    accountName: string
    campaignName: string
    campaignStatus: string
    cost: string
    costPerWebsiteLead: string
    costPerLinkClick: string
    websiteLeads: string
    linkClicks: string
    date: string
  }>
  aggregatedMetrics: {
    totalCost: number
    avgCostPerLead: number
    avgCPC: number
    totalAdSets: number
    uniqueAdSets: number
    totalLeads: number
    totalClicks: number
    historyCount: number
  }
  firstSeen: Date
  lastUpdated: Date
  savedInLibrary?: boolean
  libraryStatus?: 'draft' | 'saved'
}

interface CreativePreviewPanelProps {
  creative: GroupedCreative | null
  isOpen: boolean
  onClose: () => void
  allCreatives?: GroupedCreative[] // All creatives to find matches by Ad Set ID
}

export function CreativePreviewPanel({
  creative,
  isOpen,
  onClose,
  allCreatives = []
}: CreativePreviewPanelProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

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
        {creative && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="font-league-spartan text-[1.675rem] leading-[1.2] font-medium text-black mb-1">
                    {creative.campaignName}
                  </h2>
                  <p className="text-xs text-gray-500 font-['DM_Sans'] font-normal">
                    {creative.imageAssetName}
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

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 text-xs font-['DM_Sans']">
                <Badge
                  className={`px-3 py-1 rounded-full ${
                    creative.campaignStatus?.toLowerCase() === 'active'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : creative.campaignStatus?.toLowerCase() === 'paused'
                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {creative.campaignStatus || 'Unknown'}
                </Badge>
                {creative.libraryStatus && (
                  <Badge
                    className={`px-3 py-1 rounded-full ${
                      creative.libraryStatus === 'saved'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {creative.libraryStatus.charAt(0).toUpperCase() + creative.libraryStatus.slice(1)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 flex-shrink-0">
                <div className="w-full h-12 bg-transparent border-0 rounded-none p-0 grid grid-cols-3">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`h-12 rounded-none border-b-2 font-league-spartan font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      activeTab === 'overview'
                        ? 'border-black text-black font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('adset')}
                    className={`h-12 rounded-none border-b-2 font-league-spartan font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      activeTab === 'adset'
                        ? 'border-black text-black font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Hash className="h-4 w-4" />
                    Ad Sets
                  </button>
                  <button
                    onClick={() => setActiveTab('performance')}
                    className={`h-12 rounded-none border-b-2 font-league-spartan font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
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
                {activeTab === 'overview' && (
                  <OverviewTabContent creative={creative} />
                )}
                {activeTab === 'adset' && (
                  <AdSetTabContent creative={creative} allCreatives={allCreatives} />
                )}
                {activeTab === 'performance' && (
                  <PerformanceTabContent creative={creative} />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                {/* Left side - Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Edit Creative clicked for:', creative.imageAssetId)
                    // Pass only essential data, let the page fetch the rest
                    const params = new URLSearchParams({
                      from: 'google-sheets',
                      imageAssetId: creative.imageAssetId
                    })
                    const url = `/google-sheets-records/creative-details?${params.toString()}`
                    console.log('Navigating to:', url)
                    router.push(url)
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Creative
                </Button>

                {/* Right side - Dates */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 font-['DM_Sans']">
                  <span>First Seen: {creative.firstSeen.toLocaleDateString()}</span>
                  <span>Last Updated: {creative.lastUpdated.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Overview Tab Content Component
function OverviewTabContent({ creative }: { creative: GroupedCreative }) {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-6 space-y-6">
        {/* Creative Image Preview */}
        {creative.imageUrl && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <ImageHoverPreview
                  src={creative.imageUrl}
                  alt={creative.imageAssetName}
                  className="max-w-sm max-h-64 object-contain rounded-lg border shadow-sm"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Row 1: Metrics Cards (3-column) */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total Spend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium text-gray-600">Total Spend</div>
              </div>
              <div className="text-2xl font-bold text-black mt-2">
                ${creative.aggregatedMetrics.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          {/* CPL */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium text-gray-600">CPL</div>
              </div>
              <div className="text-2xl font-bold text-black mt-2">
                ${creative.aggregatedMetrics.avgCostPerLead.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          {/* CPC */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-4 w-4 text-purple-600" />
                <div className="text-sm font-medium text-gray-600">CPC</div>
              </div>
              <div className="text-2xl font-bold text-black mt-2">
                ${creative.aggregatedMetrics.avgCPC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Row 2: Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-league-spartan text-lg font-semibold">Creative Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <div className="divide-y divide-gray-100">
              <div className="py-3">
                <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">Account Name</div>
                <div className="text-sm text-gray-900 mt-1">{creative.accountName}</div>
              </div>

              <div className="py-3">
                <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">Campaign Name</div>
                <div className="text-sm text-gray-900 mt-1" title={creative.campaignName}>
                  {creative.campaignName}
                </div>
              </div>

              <div className="py-3">
                <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">Image Asset Name</div>
                <div className="text-sm text-gray-900 mt-1" title={creative.imageAssetName}>
                  {creative.imageAssetName}
                </div>
              </div>

              <div className="py-3">
                <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">Campaign Status</div>
                <div className="mt-1">
                  <Badge
                    className={`${
                      creative.campaignStatus?.toLowerCase() === 'active'
                        ? 'bg-green-100 text-green-700'
                        : creative.campaignStatus?.toLowerCase() === 'paused'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {creative.campaignStatus || 'Unknown'}
                  </Badge>
                </div>
              </div>

              <div className="py-3">
                <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">Total Leads</div>
                <div className="text-sm text-gray-900 mt-1">{creative.aggregatedMetrics.totalLeads.toFixed(0)}</div>
              </div>

              <div className="py-3">
                <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">Total Clicks</div>
                <div className="text-sm text-gray-900 mt-1">{creative.aggregatedMetrics.totalClicks.toFixed(0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 3: Creative IDs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-league-spartan text-lg font-semibold">Creative IDs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Asset ID */}
            <div>
              <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">Image Asset ID</div>
              <div className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                {creative.imageAssetId}
              </div>
            </div>

            {/* Ad Set IDs */}
            <div>
              <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">
                Ad Set IDs ({creative.aggregatedMetrics.uniqueAdSets} unique)
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from(new Set(creative.adSets.map(adSet => adSet.adSetId))).map((adSetId, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono"
                  >
                    {adSetId}
                  </span>
                ))}
              </div>
            </div>

            {/* Ad IDs */}
            <div>
              <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">
                Ad IDs ({Array.from(new Set(creative.adSets.map(adSet => adSet.adId))).length} unique)
              </div>
              <div className="mt-2 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {Array.from(new Set(creative.adSets.map(adSet => adSet.adId))).map((adId, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-mono"
                  >
                    {adId}
                  </span>
                ))}
              </div>
            </div>

            {/* Ad Creative IDs */}
            <div>
              <div className="font-league-spartan text-xs text-gray-700 uppercase tracking-wide">
                Ad Creative IDs ({Array.from(new Set(creative.adSets.map(adSet => adSet.adCreativeId))).length} unique)
              </div>
              <div className="mt-2 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {Array.from(new Set(creative.adSets.map(adSet => adSet.adCreativeId))).map((adCreativeId, index) => (
                  <span
                    key={index}
                    className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-mono"
                  >
                    {adCreativeId}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

// Ad Set Tab Content
function AdSetTabContent({ creative, allCreatives }: { creative: GroupedCreative, allCreatives: GroupedCreative[] }) {
  // Group ad sets by adSetId to create unique ad sets
  const uniqueAdSets = Array.from(
    new Map(
      creative.adSets.map(adSet => [adSet.adSetId, adSet])
    ).values()
  )

  // Find all creatives in each ad set by searching through all creatives
  const getCreativesInAdSet = (adSetId: string) => {
    const creativesInAdSet: (GroupedCreative & { adSetData?: any })[] = []

    // Search through all creatives to find ones that have this ad set ID
    allCreatives.forEach(otherCreative => {
      // Check if this creative has an ad set with the matching ID
      const matchingAdSet = otherCreative.adSets.find(adSet => adSet.adSetId === adSetId)
      if (matchingAdSet) {
        creativesInAdSet.push({
          ...otherCreative,
          adSetData: matchingAdSet
        })
      }
    })

    // If no matches found in allCreatives (fallback), include the current creative
    if (creativesInAdSet.length === 0) {
      const currentCreativeAdSet = creative.adSets.find(ads => ads.adSetId === adSetId)
      if (currentCreativeAdSet) {
        creativesInAdSet.push({
          ...creative,
          adSetData: currentCreativeAdSet
        })
      }
    }

    return creativesInAdSet
  }

  const handleCreativeClick = (creative: GroupedCreative) => {
    // TODO: Navigate to creative details or open in new modal
    console.log('Creative clicked:', creative.imageAssetName)
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-6 space-y-4">
        {uniqueAdSets.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {uniqueAdSets.map((adSet, index) => {
              const creativesInAdSet = getCreativesInAdSet(adSet.adSetId)

              return (
                <AccordionItem
                  key={adSet.adSetId}
                  value={`adset-${index}`}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                          Ad Set {index + 1} ({creativesInAdSet.length} creative{creativesInAdSet.length !== 1 ? 's' : ''})
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {adSet.adSetId}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-3">
                      {creativesInAdSet.map((creativeInAdSet) => (
                        <AdSetCreativeCard
                          key={`${creativeInAdSet.imageAssetId}-${adSet.adSetId}`}
                          creative={creativeInAdSet}
                          adSetData={creativeInAdSet.adSetData}
                          onClick={() => handleCreativeClick(creativeInAdSet)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-sm">No ad sets found for this creative.</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Ad Set Creative Card Component (preserves original design from AdSetInspectorPanel)
function AdSetCreativeCard({
  creative,
  adSetData,
  onClick
}: {
  creative: GroupedCreative & { adSetData?: any }
  adSetData?: any
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Navigate to creative details page or open editing modal
    console.log('Eye clicked for:', creative.imageAssetName)
  }

  // Calculate metrics from the specific ad set data if available
  const metrics = adSetData ? {
    cost: parseFloat(adSetData.cost || '0'),
    cpl: parseFloat(adSetData.costPerWebsiteLead || '0'),
    cpc: parseFloat(adSetData.costPerLinkClick || '0'),
    leads: parseFloat(adSetData.websiteLeads || '0'),
    clicks: parseFloat(adSetData.linkClicks || '0')
  } : {
    cost: creative.aggregatedMetrics.totalCost,
    cpl: creative.aggregatedMetrics.avgCostPerLead,
    cpc: creative.aggregatedMetrics.avgCPC,
    leads: creative.aggregatedMetrics.totalLeads,
    clicks: creative.aggregatedMetrics.totalClicks
  }

  return (
    <div
      className="bg-white border border-[#E6E6E6] hover:border-black hover:shadow-sm rounded-xl p-3 cursor-pointer transition-all duration-160 box-border"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`View creative ${creative.imageAssetName}`}
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
              CPL: ${metrics.cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | CPC: ${metrics.cpc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Leads: {metrics.leads.toFixed(0)}
            </span>

            {/* Status badges */}
            <div className="flex items-center gap-1">
              {creative.campaignStatus && creative.campaignStatus !== 'Unknown' && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  creative.campaignStatus.toLowerCase() === 'active'
                    ? 'bg-green-100 text-green-700'
                    : creative.campaignStatus.toLowerCase() === 'paused'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {creative.campaignStatus}
                </span>
              )}

              {creative.libraryStatus && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  creative.libraryStatus === 'saved'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {creative.libraryStatus.charAt(0).toUpperCase() + creative.libraryStatus.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Performance Tab Content
function PerformanceTabContent({ creative }: { creative: GroupedCreative }) {
  const [activeMetrics, setActiveMetrics] = useState(['spend', 'leads'])

  // Process creative data for time-series visualization
  const performanceData = useMemo(() => {
    // Group all ad set entries by date and aggregate metrics
    const dateMap = new Map()

    creative.adSets.forEach(adSet => {
      const date = adSet.date.split('T')[0] // Get YYYY-MM-DD

      const cost = parseFloat(adSet.cost || '0')
      const leads = parseFloat(adSet.websiteLeads || '0')
      const clicks = parseFloat(adSet.linkClicks || '0')
      const costPerLead = parseFloat(adSet.costPerWebsiteLead || '0')
      const costPerClick = parseFloat(adSet.costPerLinkClick || '0')

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          spend: 0,
          leads: 0,
          clicks: 0,
          totalCost: 0,
          totalLeads: 0,
          totalClicks: 0,
          entries: 0
        })
      }

      const dayData = dateMap.get(date)
      dayData.spend += cost
      dayData.leads += leads
      dayData.clicks += clicks
      dayData.totalCost += cost
      dayData.totalLeads += leads
      dayData.totalClicks += clicks
      dayData.entries += 1
    })

    // Convert to array and calculate averages
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(day => ({
        ...day,
        cpl: day.totalLeads > 0 ? day.totalCost / day.totalLeads : 0,
        cpc: day.totalClicks > 0 ? day.totalCost / day.totalClicks : 0,
        dateFormatted: new Date(day.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }))
  }, [creative.adSets])

  // Leads per day data (same as above but focused on leads)
  const leadsPerDayData = useMemo(() => {
    return performanceData.map(day => ({
      date: day.dateFormatted,
      leads: Math.round(day.leads),
      fullDate: day.date
    }))
  }, [performanceData])

  // Calculate total metrics
  const totalMetrics = useMemo(() => {
    return {
      totalSpend: creative.aggregatedMetrics.totalCost,
      totalLeads: creative.aggregatedMetrics.totalLeads,
      totalClicks: creative.aggregatedMetrics.totalClicks,
      avgCPL: creative.aggregatedMetrics.avgCostPerLead,
      avgCPC: creative.aggregatedMetrics.avgCPC
    }
  }, [creative.aggregatedMetrics])

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-6 space-y-6">
        {/* Performance Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium text-gray-600">Total Spend</div>
              </div>
              <div className="text-2xl font-bold text-black mt-2">
                ${totalMetrics.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium text-gray-600">Avg CPL</div>
              </div>
              <div className="text-2xl font-bold text-black mt-2">
                ${totalMetrics.avgCPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-4 w-4 text-purple-600" />
                <div className="text-sm font-medium text-gray-600">Avg CPC</div>
              </div>
              <div className="text-2xl font-bold text-black mt-2">
                ${totalMetrics.avgCPC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-league-spartan text-lg font-semibold">Performance Trends</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Track key metrics over time for this creative
            </p>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <div className="space-y-4">
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
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value, name) => {
                          if (name === 'spend') return [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Spend']
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

                {/* Metric Toggle Buttons */}
                <div className="flex justify-center flex-wrap gap-2 pt-3 border-t border-gray-100">
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
                        className={`
                          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                          ${isActive
                            ? 'border text-black'
                            : 'border border-gray-200 text-gray-600 opacity-60 hover:opacity-100'
                          }
                        `}
                        style={{
                          borderColor: isActive ? metric.color : undefined,
                          backgroundColor: isActive ? `color-mix(in srgb, ${metric.color} 8%, #fff)` : '#fff'
                        }}
                      >
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: metric.color }}
                        />
                        {metric.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-sm mb-1">No performance data available</div>
                  <div className="text-xs">Data will appear when performance history is recorded</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Per Day Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-league-spartan text-lg font-semibold">Leads per Day</CardTitle>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-600">
                Daily leads generated by this creative
              </p>
              <div className="text-sm text-gray-600">
                Total Leads: <span className="font-semibold">{Math.round(totalMetrics.totalLeads)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {leadsPerDayData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsPerDayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
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
                      formatter={(value) => [`${value}`, 'Leads']}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}