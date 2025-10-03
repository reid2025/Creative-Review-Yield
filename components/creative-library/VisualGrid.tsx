'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Eye, Palette, Briefcase, FileText, Star, Zap, ImageIcon, User, MessageSquare, ChevronDown } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatCT, fromFirebaseTimestamp } from '@/lib/timezone-utils'

import { EnhancedCreative } from '@/contexts/CreativeDataContext'

interface Creative {
  id: string
  imageUrl?: string
  imageW?: number
  imageH?: number
  accountName?: string
  campaignName?: string
  designer?: string
  litigationName?: string
  campaignType?: string
  headlineTags?: string[]
  tags?: string[]
  performance?: {
    cpl?: number
    cpc?: number
    ctr?: number
    updatedAt?: any
  }
  updatedAt?: any
  markedAsTopAd?: boolean
  optimization?: boolean
  disclaimer?: boolean
  imageryType?: string[]
  imageryBackground?: string[]
  clientBranding?: boolean
  iconsUsed?: boolean
  questionBasedHeadline?: boolean
  ctaVerb?: string
  ctaStyleGroup?: string
  ctaColor?: string
  ctaPosition?: string
}

interface GridFilters {
  designers: string[]
  litigationName: string
  campaignType: string
  markedTopAd: boolean | null
  optimization: boolean | null
  disclaimer: boolean | null
  imageryTypes: string[]
  imageryBackgrounds: string[]
  clientBranding: boolean | null
  iconsUsed: boolean | null
  questionBasedHeadline: boolean | null
  headlineTags: string[]
  ctaVerbs: string[]
  ctaStyleGroups: string[]
  ctaColors: string[]
  ctaPositions: string[]
  cplBucket: string
  cpcBucket: string
}

interface VisualGridProps {
  creatives: Creative[]
  filters: GridFilters
  onChange: (filters: Partial<GridFilters>) => void
  sort: string
  onSortChange: (sort: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEditCreative: (creativeId: string) => void
  onResetFilters?: () => void
}

interface MasonryGridProps {
  creatives: EnhancedCreative[]
  onEditCreative: (creativeId: string) => void
  onResetFilters?: () => void
  hasFilters?: boolean
  getImageUrlForCreative: (creative: EnhancedCreative) => string | undefined
}

interface CreativeCardProps {
  creative: Creative
  onEdit: (id: string) => void
}

const formatCTTime = (date: Date | any | null | undefined): string => {
  if (!date) return 'Never'
  
  // Handle Firebase timestamps
  if (date.toDate && typeof date.toDate === 'function') {
    return formatCT(fromFirebaseTimestamp(date), 'MMM d, yyyy')
  }
  
  return formatCT(date, 'MMM d, yyyy')
}

const getPerformanceBucket = (value: number | undefined, type: 'cpl' | 'cpc'): string => {
  if (!value || value <= 0) return 'unknown'
  
  if (type === 'cpl') {
    if (value < 50) return 'low'
    if (value < 150) return 'medium'
    return 'high'
  } else {
    if (value < 1) return 'low'
    if (value < 3) return 'medium'
    return 'high'
  }
}

const CreativeCard: React.FC<CreativeCardProps> = ({ creative, onEdit }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const getCampaignName = () => creative.campaignName || 'Unknown Campaign'
  const getAccountName = () => creative.accountName || 'Unknown Account'
  
  const getMetrics = () => {
    const cpl = creative.performance?.cpl
    const cpc = creative.performance?.cpc
    // Calculate CTR from CPC and CPL if available, otherwise use placeholder
    const ctr = (cpl && cpc && cpc > 0) ? ((cpc / cpl) * 100) : null
    
    return {
      cpl: cpl ? `$${cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
      cpc: cpc ? `$${cpc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—', 
      ctr: ctr ? `${ctr.toFixed(1)}%` : '—'
    }
  }

  const getRelativeTime = () => {
    const updatedAt = creative.performance?.updatedAt?.toDate?.() || creative.updatedAt
    if (!updatedAt) return 'Unknown'
    
    const now = new Date()
    const diff = now.getTime() - (updatedAt.getTime ? updatedAt.getTime() : new Date(updatedAt).getTime())
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return '1d ago'
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months === 1) return '1mo ago'
    if (months < 12) return `${months}mo ago`
    const years = Math.floor(months / 12)
    return years === 1 ? '1yr ago' : `${years}yr ago`
  }

  const metrics = getMetrics()

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white border border-gray-200 cursor-pointer"
      onClick={() => onEdit(creative.id)}
    >
      {/* 1:1 Thumbnail */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
        {creative.imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse">
                <div className="w-full h-full bg-gray-300 rounded-t-lg"></div>
              </div>
            )}
            <Image
              src={creative.imageUrl}
              alt={getCampaignName()}
              fill
              className={cn(
                "object-cover transition-opacity duration-300 rounded-t-lg",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-t-lg">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Title */}
        <h3 
          className="font-medium text-sm text-black line-clamp-1 mb-1 font-['DM_Sans']"
          title={getCampaignName()}
        >
          {getCampaignName()}
        </h3>
        
        {/* Subline */}
        <p 
          className="text-xs text-gray-500 line-clamp-1 mb-3 font-['DM_Sans']"
          title={`${getCampaignName()} • ${getAccountName()}`}
        >
          {getCampaignName()} • {getAccountName()}
        </p>

        {/* Metrics row */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 font-['DM_Sans']">
          <span>{metrics.cpl}</span>
          <span>—</span>
          <span>{metrics.cpc}</span>
          <span>—</span>
          <span>{metrics.ctr}</span>
        </div>

        {/* Updated time */}
        <div className="text-xs text-gray-500 font-['DM_Sans']">
          Updated: {getRelativeTime()}
        </div>
      </CardContent>
    </Card>
  )
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  creatives, 
  onEditCreative, 
  onResetFilters, 
  hasFilters, 
  getImageUrlForCreative 
}) => {
  const [columns, setColumns] = useState(3)
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 768) setColumns(1)
      else if (width < 1200) setColumns(2) 
      else if (width < 1600) setColumns(3)
      else setColumns(4)
    }
    
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // Map EnhancedCreative to Creative format
  const mappedCreatives: Creative[] = useMemo(() => {
    return creatives.map((enhancedCreative): Creative => {
      const formData = enhancedCreative.formData || {}
      const gsData = enhancedCreative.googleSheetsData
      
      return {
        id: enhancedCreative.id,
        imageUrl: getImageUrlForCreative(enhancedCreative),
        accountName: formData.accountName,
        campaignName: formData.campaignName,
        designer: formData.designer,
        litigationName: formData.litigationName,
        campaignType: formData.campaignType,
        performance: {
          cpl: formData.cpl || gsData?.performanceHistory?.[0]?.costPerWebsiteLead ? parseFloat(gsData.performanceHistory[0].costPerWebsiteLead) : undefined,
          cpc: formData.cpc || gsData?.performanceHistory?.[0]?.costPerLinkClick ? parseFloat(gsData.performanceHistory[0].costPerLinkClick) : undefined,
          updatedAt: gsData?.lastUpdated || enhancedCreative.lastSaved
        },
        updatedAt: enhancedCreative.lastSaved,
        markedAsTopAd: formData.markedAsTopAd,
        optimization: formData.optimization,
        headlineTags: Array.isArray(formData.headlineTags) ? formData.headlineTags : [],
        tags: Array.isArray(formData.tags) ? formData.tags : []
      }
    })
  }, [creatives, getImageUrlForCreative])

  if (creatives.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="py-12 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved creatives yet</h3>
          <p className="text-gray-600">
            {hasFilters ? 'Try adjusting your filters to see more results.' : 'Save some creatives to see them here.'}
          </p>
          {hasFilters && onResetFilters && (
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div 
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {mappedCreatives.map((creative) => (
          <CreativeCard
            key={creative.id}
            creative={creative}
            onEdit={onEditCreative}
          />
        ))}
      </div>
    </div>
  )
}

const MultiSelectFilter: React.FC<{
  title: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  icon: React.ComponentType<{ className?: string }>
}> = ({ title, options, selected, onChange, icon: Icon }) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start h-7 text-xs px-2">
          <Icon className="h-3 w-3 mr-1" />
          {selected.length === 0 ? title : `${title} (${selected.length})`}
          <ChevronDown className="h-3 w-3 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-3 border-b">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {filteredOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2 py-2">
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selected, option])
                  } else {
                    onChange(selected.filter(s => s !== option))
                  }
                }}
              />
              <label className="text-sm cursor-pointer flex-1">{option}</label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MasonryGrid }

export const VisualGrid: React.FC<VisualGridProps> = () => {
  return null
}