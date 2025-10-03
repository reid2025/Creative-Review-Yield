'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
// Removed date-fns imports - using timezone-utils instead
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData'
import { useCreativeData } from '@/contexts/CreativeDataContext'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FloatingInput } from '@/components/ui/floating-input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar } from '@/components/ui/calendar'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

// Icons
import { 
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  ImageOff,
  Eye,
  Calendar as CalendarIcon,
  X,
  Users,
  Tag,
  Activity,
  History,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  RotateCcw
} from 'lucide-react'

// Custom Components
import { ImageHoverPreview } from '@/components/ImageHoverPreview'
import { PerformanceHoverCard } from '@/components/PerformanceHoverCard'
import { CreativePreviewPanel } from '@/components/CreativePreviewPanel'
import { FilterTagsDisplay } from '@/components/FilterTagsDisplay'
import { formatTexasTime } from '@/lib/utils'
import {
  isTodayCT,
  isYesterdayCT,
  isThisWeekCT,
  isThisMonthCT,
  isThisYearCT,
  toCT
} from '@/lib/timezone-utils'


interface CreativeHistoryEntry {
  date: string
  cost: string
  costPerWebsiteLead: string
  costPerLinkClick: string
  dataSource: 'google-sheets' | 'manual'
}

interface AdSetEntry {
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
}

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
  adSets: AdSetEntry[]
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
  libraryStatus?: 'draft' | 'saved' | 'published'
}

export default function CreativeStreamPage() {
  const router = useRouter()
  const { enhancedCreatives } = useCreativeData()

  // Helper function to convert internal lowercase values to display Title Case
  const getStatusDisplayName = (value: string): string => {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'paused': 'Paused',
      'inactive': 'Inactive',
      'saved': 'Saved',
      'draft': 'Draft',
      'published': 'Published'
    }
    return statusMap[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }

  // Date range utility functions
  const datePresets = [
    { key: 'all', label: 'All Time', days: null },
    { key: 'today', label: 'Today', days: 0 },
    { key: 'yesterday', label: 'Yesterday', days: 1 },
    { key: 'last-7', label: 'Last 7 Days', days: 7 },
    { key: 'last-30', label: 'Last 30 Days', days: 30 },
    { key: 'this-month', label: 'This Month', type: 'month' },
    { key: 'last-month', label: 'Last Month', type: 'month' },
    { key: 'this-year', label: 'This Year', type: 'year' }
  ]

  const getDateRangeFromPreset = (preset: string) => {
    const today = new Date()
    const ctToday = toCT(today).toJSDate() // Convert to JavaScript Date

    switch (preset) {
      case 'today':
        return { from: ctToday, to: ctToday }
      case 'yesterday': {
        const yesterday = new Date(ctToday)
        yesterday.setDate(yesterday.getDate() - 1)
        return { from: yesterday, to: yesterday }
      }
      case 'last-7': {
        const weekAgo = new Date(ctToday)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return { from: weekAgo, to: ctToday }
      }
      case 'last-30': {
        const monthAgo = new Date(ctToday)
        monthAgo.setDate(monthAgo.getDate() - 30)
        return { from: monthAgo, to: ctToday }
      }
      case 'this-month': {
        const startOfMonth = new Date(ctToday.getFullYear(), ctToday.getMonth(), 1)
        return { from: startOfMonth, to: ctToday }
      }
      case 'last-month': {
        const startOfLastMonth = new Date(ctToday.getFullYear(), ctToday.getMonth() - 1, 1)
        const endOfLastMonth = new Date(ctToday.getFullYear(), ctToday.getMonth(), 0)
        return { from: startOfLastMonth, to: endOfLastMonth }
      }
      case 'this-year': {
        const startOfYear = new Date(ctToday.getFullYear(), 0, 1)
        return { from: startOfYear, to: ctToday }
      }
      default:
        return { from: null, to: null }
    }
  }

  const formatDateRange = (dateFilter: string, customRange: { from: Date | null; to: Date | null }) => {
    if (dateFilter === 'custom' && customRange.from && customRange.to) {
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      if (customRange.from.getTime() === customRange.to.getTime()) {
        return formatDate(customRange.from)
      }
      return `${formatDate(customRange.from)} - ${formatDate(customRange.to)}`
    }

    const preset = datePresets.find(p => p.key === dateFilter)
    return preset?.label || 'All Time'
  }
  
  // Use TanStack Query for secure data fetching and caching
  const { 
    data: sheetsData, 
    isLoading, 
    isError, 
    error, 
    refresh, 
    isRefreshing,
    lastFetchTime 
  } = useGoogleSheetsData()
  
  // State
  const [mergedCreatives, setMergedCreatives] = useState<GroupedCreative[]>([])
  const [filteredCreatives, setFilteredCreatives] = useState<GroupedCreative[]>([])
  const [paginatedCreatives, setPaginatedCreatives] = useState<GroupedCreative[]>([])
  const [filtering, setFiltering] = useState(false)

  // Column Management State
  interface ColumnConfig {
    id: string
    label: string
    isVisible: boolean
    isFixed: boolean
    width?: string
  }

  const defaultColumns: ColumnConfig[] = [
    { id: 'actions', label: '', isVisible: true, isFixed: true, width: 'w-12' },
    { id: 'image', label: 'Image', isVisible: true, isFixed: true, width: 'w-20' },
    { id: 'creative', label: 'Creative', isVisible: true, isFixed: false, width: 'min-w-[130px] max-w-[250px]' },
    { id: 'account', label: 'Account', isVisible: true, isFixed: false, width: 'min-w-[140px]' },
    { id: 'campaign', label: 'Campaign', isVisible: true, isFixed: false, width: 'min-w-[200px]' },
    // Optional columns (hidden by default) - these should come before Status
    { id: 'history', label: 'History', isVisible: false, isFixed: false, width: 'w-20' },
    { id: 'adSets', label: 'Ad Sets', isVisible: false, isFixed: false, width: 'w-20' },
    { id: 'cost', label: 'Cost', isVisible: false, isFixed: false, width: 'w-24' },
    { id: 'cpl', label: 'CPL', isVisible: false, isFixed: false, width: 'w-20' },
    { id: 'cpc', label: 'CPC', isVisible: false, isFixed: false, width: 'w-20' },
    { id: 'leads', label: 'Leads', isVisible: false, isFixed: false, width: 'w-20' },
    { id: 'clicks', label: 'Clicks', isVisible: false, isFixed: false, width: 'w-20' },
    // Status column should always be last
    { id: 'status', label: 'Status', isVisible: true, isFixed: false, width: 'w-24' }
  ]

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    // Force clear old localStorage and use fresh defaultColumns
    if (typeof window !== 'undefined') {
      // Clear the old cached columns to force using new defaults
      localStorage.removeItem('creativeStreamColumns')
    }
    return defaultColumns
  })

  // Save column configuration to localStorage
  const saveColumnConfig = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns)
    if (typeof window !== 'undefined') {
      localStorage.setItem('creativeStreamColumns', JSON.stringify(newColumns))
    }
  }

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    const newColumns = columns.map(col =>
      col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
    )
    saveColumnConfig(newColumns)
  }

  // Reset to default columns
  const resetColumns = () => {
    saveColumnConfig(defaultColumns)
  }

  // Get visible columns
  const visibleColumns = columns.filter(col => col.isVisible)

  // Helper function to render table cells based on column
  const renderTableCell = (columnId: string, entry: GroupedCreative, metrics: any, handlers?: any) => {
    const getStickyClass = (columnId: string) => {
      if (columnId === 'actions') return 'sticky left-0 z-10 bg-white'
      if (columnId === 'image') return 'sticky left-12 z-10 bg-white'
      return ''
    }

    const cellClass = `px-4 ${getStickyClass(columnId)}`

    switch (columnId) {
      case 'actions':
        return (
          <TableCell key={columnId} className={`px-2 text-center ${getStickyClass(columnId)}`}>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
          </TableCell>
        )

      case 'image':
        return (
          <TableCell key={columnId} className={cellClass}>
            {entry.imageUrl ? (
              <ImageHoverPreview
                src={entry.imageUrl}
                alt={entry.imageAssetName}
                className="h-12 w-12 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <ImageOff className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </TableCell>
        )

      case 'creative':
        return (
          <TableCell key={columnId} className={cellClass}>
            <div className="text-sm text-gray-900 font-medium line-clamp-2">{entry.imageAssetName}</div>
          </TableCell>
        )

      case 'account':
        return (
          <TableCell key={columnId} className={cellClass}>
            <div className="text-sm text-gray-900">{entry.accountName}</div>
          </TableCell>
        )

      case 'campaign':
        return (
          <TableCell key={columnId} className={cellClass}>
            <div className="text-sm text-gray-900 line-clamp-1">{entry.campaignName}</div>
          </TableCell>
        )

      case 'history':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="text-sm text-gray-900 font-medium">{metrics.historyCount}</div>
            <div className="text-xs text-gray-500">entries</div>
          </TableCell>
        )

      case 'adSets':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="text-sm text-gray-900 font-medium">{metrics.adSets}</div>
            <div className="text-xs text-gray-500">ad sets</div>
          </TableCell>
        )

      case 'cost':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="text-sm text-gray-900 font-medium">${metrics.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </TableCell>
        )

      case 'cpl':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="text-sm text-gray-900 font-medium">${metrics.cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </TableCell>
        )

      case 'cpc':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="text-sm text-gray-900 font-medium">${metrics.cpc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </TableCell>
        )

      case 'leads':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="text-sm text-gray-900 font-medium">{metrics.leads}</div>
          </TableCell>
        )

      case 'clicks':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="text-sm text-gray-900 font-medium">{metrics.clicks}</div>
          </TableCell>
        )

      case 'status':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <div className="flex justify-center items-center gap-1">
              {/* Campaign Delivery Status Badge */}
              <Badge
                className={`text-xs px-2 py-1 rounded-full ${
                  entry.campaignStatus?.toLowerCase() === 'active'
                    ? 'bg-green-500 text-white hover:bg-green-500'
                    : entry.campaignStatus?.toLowerCase() === 'paused'
                    ? 'bg-orange-500 text-white hover:bg-orange-500'
                    : 'bg-gray-500 text-white hover:bg-gray-500'
                }`}
              >
                {entry.campaignStatus ? getStatusDisplayName(entry.campaignStatus) : 'Unknown'}
              </Badge>

              {/* Library Status Badge - Show Published badge if published */}
              {entry.libraryStatus === 'published' && (
                <Badge className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-100">
                  Published
                </Badge>
              )}
            </div>
          </TableCell>
        )

      case 'campaignStatus':
        return (
          <TableCell key={columnId} className={`${cellClass} text-center`}>
            <Badge
              className={`text-xs px-2 py-1 rounded-full ${
                entry.campaignStatus?.toLowerCase() === 'active'
                  ? 'bg-green-500 text-white hover:bg-green-500'
                  : entry.campaignStatus?.toLowerCase() === 'paused'
                  ? 'bg-orange-500 text-white hover:bg-orange-500'
                  : 'bg-gray-500 text-white hover:bg-gray-500'
              }`}
            >
              {entry.campaignStatus || 'Unknown'}
            </Badge>
          </TableCell>
        )

      default:
        return (
          <TableCell key={columnId} className={cellClass}>
            <div className="text-sm text-gray-900">-</div>
          </TableCell>
        )
    }
  }
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [accountFilter, setAccountFilter] = useState<string[] | null>(null)
  const [campaignFilter, setCampaignFilter] = useState<string[] | null>(null)
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string | null>(null)
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Sorting
  const [sortBy, setSortBy] = useState('date-desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Creative Preview Panel
  const [selectedCreative, setSelectedCreative] = useState<GroupedCreative | null>(null)
  const [isCreativePreviewOpen, setIsCreativePreviewOpen] = useState(false)
  
  // Update merged creatives when data changes
  useEffect(() => {
    const updateData = async () => {
      if (!sheetsData || isLoading) return
      
      setFiltering(true) // Show loading state while processing all data
      
      // Check Firebase for saved status
      const creativesRef = collection(db, 'creatives')
      const snapshot = await getDocs(query(creativesRef))
      
      const savedAssetIds = new Set<string>()
      const statusMap = new Map<string, 'draft' | 'saved'>()

      snapshot.forEach((doc) => {
        const data = doc.data()
        const status = data.status || 'draft'

        // Debug logging for specific creatives only
        if (data.imageAssetId?.includes('23857') || data.formData?.imageAssetId?.includes('23857')) {
          console.log('🔍 Firebase doc (Sample ID):', {
            id: doc.id,
            status,
            imageAssetId: data.imageAssetId || data.formData?.imageAssetId
          })
        }

        // Store Image Asset ID ONLY - no other matching
        if (data.imageAssetId) {
          savedAssetIds.add(data.imageAssetId)
          statusMap.set(data.imageAssetId, status)
        }
        if (data.formData?.imageAssetId) {
          savedAssetIds.add(data.formData.imageAssetId)
          statusMap.set(data.formData.imageAssetId, status)
        }
      })
      
      // Debug: Check enhanced creatives
      const publishedCreatives = enhancedCreatives.filter(ec => ec.status === 'published')
      console.log('🔍 Enhanced creatives debug:', {
        totalEnhanced: enhancedCreatives.length,
        publishedCount: publishedCreatives.length,
        publishedFilenames: publishedCreatives.map(ec => ec.creativeFilename)
      })

      // Process all daily entries with status information
      const mergedWithStatus = sheetsData.mergedCreatives.map((entry: GroupedCreative) => {
        // Only match by imageAssetId - no fallbacks
        const assetIdInSaved = savedAssetIds.has(entry.imageAssetId)
        let isSaved = assetIdInSaved
        let status: 'draft' | 'saved' | 'published' | undefined

        if (isSaved) {
          // Get status from imageAssetId only
          status = statusMap.get(entry.imageAssetId) || 'draft'
        }

        // Also check enhancedCreatives for published status
        const enhancedCreative = enhancedCreatives.find(ec => {
          // Match by image asset name or creative filename
          const entryAssetName = entry.imageAssetName?.toLowerCase() || ''
          const creativeFilename = ec.creativeFilename?.toLowerCase() || ''

          return entryAssetName && creativeFilename && (
            entryAssetName.includes(creativeFilename) ||
            creativeFilename.includes(entryAssetName)
          )
        })

        if (enhancedCreative && enhancedCreative.status === 'published') {
          status = 'published'
          isSaved = true
          console.log('🟢 Found enhanced creative match:', {
            entryAssetName: entry.imageAssetName,
            creativeFilename: enhancedCreative.creativeFilename,
            enhancedStatus: enhancedCreative.status,
            finalStatus: status
          })
        }

        // Debug logging for specific creatives only
        if (entry.imageAssetId?.includes('23857')) {
          console.log('🔍 Daily entry processing:', {
            imageAssetId: entry.imageAssetId,
            assetName: entry.imageAssetName,
            assetIdInSaved,
            isSaved,
            finalStatus: status,
            enhancedCreativeStatus: enhancedCreative?.status,
            adSetCount: entry.aggregatedMetrics.uniqueAdSets
          })
        }

        return {
          ...entry,
          savedInLibrary: isSaved,
          libraryStatus: status
        }
      })
      
      // Ensure all data is processed before setting state
      setMergedCreatives(mergedWithStatus)
      // Initial load - show all creatives before filters are applied
      setFilteredCreatives(mergedWithStatus)
      setFiltering(false) // Data is now ready for filtering
    }
    
    updateData()
  }, [sheetsData, isLoading, enhancedCreatives.length])
  
  // Helper function to check if a creative matches date filter using Central Time boundaries
  const matchesDateFilter = (creative: GroupedCreative, filter: string, customRange?: { from: Date | null; to: Date | null }): boolean => {
    if (filter === 'all') return true

    // Get the latest date from the creative's aggregated data
    const latestDate = creative.lastUpdated

    // Convert UTC date to Central Time for comparison
    const centralDate = toCT(latestDate)

    // Handle custom date range
    if (filter === 'custom' && customRange?.from) {
      const from = new Date(customRange.from)
      const to = customRange.to ? new Date(customRange.to) : from

      // Set time boundaries for accurate comparison
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)

      return centralDate >= from && centralDate <= to
    }

    switch (filter) {
      case 'today':
        return isTodayCT(centralDate)
      case 'yesterday':
        return isYesterdayCT(centralDate)
      case 'last-7': {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return centralDate >= weekAgo
      }
      case 'last-30': {
        const monthAgo = new Date()
        monthAgo.setDate(monthAgo.getDate() - 30)
        return centralDate >= monthAgo
      }
      case 'this-week':
        return isThisWeekCT(centralDate)
      case 'this-month':
        return isThisMonthCT(centralDate)
      case 'last-month': {
        const today = new Date()
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        endOfLastMonth.setHours(23, 59, 59, 999)
        return centralDate >= startOfLastMonth && centralDate <= endOfLastMonth
      }
      case 'this-year':
        return isThisYearCT(centralDate)
      default:
        return true
    }
  }

  // Handle search input with debounce
  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    setFiltering(true)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value)
      setFiltering(false)
    }, 2000)
  }
  
  // Apply filters - only when we have complete data
  useEffect(() => {
    // Don't apply filters while loading or if no data yet
    if (isLoading || mergedCreatives.length === 0) return
    
    setFiltering(true)
    
    const filterTimeout = setTimeout(() => {
      let filtered = [...mergedCreatives]
      
      console.log(`🔍 STARTING FILTER PROCESS:`, {
        totalCreatives: filtered.length,
        searchQuery,
        dateFilter,
        accountFilter,
        campaignFilter,
        deliveryStatusFilter,
        workflowStatusFilter
      })
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(c => 
          c.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.imageAssetName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Apply date filter (always apply since default is 'today')
      const beforeDateFilter = filtered.length
      filtered = filtered.filter(c => matchesDateFilter(c, dateFilter, customDateRange))
      console.log(`Date filter "${dateFilter}": ${beforeDateFilter} → ${filtered.length} results`)
      
      // Apply account filter - multi-select with null state support
      if (accountFilter !== null && accountFilter.length > 0) {
        const beforeAccountFilter = filtered.length
        filtered = filtered.filter(c => {
          // Split account names by "|" and check if any matches selected accounts
          const accounts = c.accountName.split(' | ').map(account => account.trim())
          return accountFilter.some(selectedAccount => accounts.includes(selectedAccount))
        })
        console.log(`Account filter [${accountFilter.join(', ')}]: ${beforeAccountFilter} → ${filtered.length} results`)
      } else {
        console.log(`Account filter: ${accountFilter === null ? 'default (all)' : 'empty'} - no filtering applied`)
      }
      
      // Apply campaign filter - multi-select with null state support
      if (campaignFilter !== null && campaignFilter.length > 0) {
        const beforeCampaignFilter = filtered.length
        filtered = filtered.filter(c => {
          // Split campaign names by "|" and check if any matches selected campaigns
          const campaigns = c.campaignName.split(' | ').map(campaign => campaign.trim())
          return campaignFilter.some(selectedCampaign => campaigns.includes(selectedCampaign))
        })
        console.log(`Campaign filter [${campaignFilter.join(', ')}]: ${beforeCampaignFilter} → ${filtered.length} results`)
      } else {
        console.log(`Campaign filter: ${campaignFilter === null ? 'default (all)' : 'empty'} - no filtering applied`)
      }
      
      // Apply status filters with proper boolean logic (AND across sections)
      if (deliveryStatusFilter !== null || workflowStatusFilter !== null) {
        const beforeStatusFilter = filtered.length

        filtered = filtered.filter(c => {
          // Build clauses for each section
          const clauses = []

          // Delivery status clause
          if (deliveryStatusFilter !== null) {
            const normalizedCampaignStatus = c.campaignStatus?.toLowerCase() || ''
            const deliveryMatch = normalizedCampaignStatus === deliveryStatusFilter
            clauses.push(deliveryMatch)
          }

          // Workflow status clause
          if (workflowStatusFilter !== null) {
            let workflowMatch = false

            // Handle special filters
            if (workflowStatusFilter === 'show-published-only') {
              workflowMatch = c.libraryStatus === 'published'
            } else if (workflowStatusFilter === 'show-not-published') {
              workflowMatch = !c.libraryStatus || c.libraryStatus !== 'published'
            } else {
              // Handle regular status filters
              const normalizedLibraryStatus = c.libraryStatus?.toLowerCase()
              workflowMatch = normalizedLibraryStatus === workflowStatusFilter
            }

            clauses.push(workflowMatch)
          }

          // AND across sections: all clauses must be true
          return clauses.every(clause => clause === true)
        })

        console.log(`Status filter [Delivery: ${deliveryStatusFilter || 'all'}, Workflow: ${workflowStatusFilter || 'all'}]: ${beforeStatusFilter} → ${filtered.length} results`)
      } else {
        console.log(`Status filter: default (all) - no filtering applied`)
      }
      
      
      // Apply sorting based on selected sort option
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return b.lastUpdated.getTime() - a.lastUpdated.getTime()
          case 'date-asc':
            return a.lastUpdated.getTime() - b.lastUpdated.getTime()
          case 'cost-desc':
            return b.aggregatedMetrics.totalCost - a.aggregatedMetrics.totalCost
          case 'cost-asc':
            return a.aggregatedMetrics.totalCost - b.aggregatedMetrics.totalCost
          case 'name-asc':
            return a.imageAssetName.localeCompare(b.imageAssetName)
          case 'name-desc':
            return b.imageAssetName.localeCompare(a.imageAssetName)
          default:
            return b.lastUpdated.getTime() - a.lastUpdated.getTime()
        }
      })
      
      setFilteredCreatives(filtered)
      
      // Reset to first page when filters change
      setCurrentPage(1)
      setFiltering(false)
    }, 100)
    
    return () => clearTimeout(filterTimeout)
  }, [searchQuery, dateFilter, customDateRange, accountFilter, campaignFilter, deliveryStatusFilter, workflowStatusFilter, mergedCreatives, isLoading, sortBy])

  // Apply pagination to filtered results
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginated = filteredCreatives.slice(startIndex, endIndex)
    setPaginatedCreatives(paginated)
  }, [filteredCreatives, currentPage, itemsPerPage])

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Independent filter logic - Accounts and Campaigns work independently

  // Calculate pagination info
  const totalPages = Math.ceil(filteredCreatives.length / itemsPerPage)
  const totalItems = filteredCreatives.length

  // Get unique accounts and campaigns - cleaner logic
  const getUniqueAccounts = () => {
    const accounts = new Set<string>()

    // Start with date-filtered creatives only - don't filter by campaigns for accounts
    let relevantCreatives = mergedCreatives.filter(creative =>
      matchesDateFilter(creative, dateFilter, customDateRange)
    )

    // NOTE: Removed campaign filtering for accounts - always show full account list

    // Extract unique accounts from filtered creatives
    relevantCreatives.forEach(creative => {
      creative.accountName.split(' | ').forEach(account => {
        const trimmed = account.trim()
        if (trimmed) accounts.add(trimmed)
      })
    })

    const result = Array.from(accounts).sort()
    console.log(`getUniqueAccounts: ${result.length} accounts (always showing full list, date: "${dateFilter}")`)
    return result
  }

  const getUniqueCampaigns = (selectedAccounts?: string[] | null) => {
    const campaigns = new Set<string>()
    
    // Start with date-filtered creatives
    let relevantCreatives = mergedCreatives.filter(creative =>
      matchesDateFilter(creative, dateFilter, customDateRange)
    )
    
    // If account filter is applied, further filter by selected accounts
    if (selectedAccounts !== null && selectedAccounts && selectedAccounts.length > 0) {
      relevantCreatives = relevantCreatives.filter(creative => {
        const accounts = creative.accountName.split(' | ').map(account => account.trim())
        return selectedAccounts.some(selectedAccount => accounts.includes(selectedAccount))
      })
    }
    
    // Extract unique campaigns from filtered creatives
    relevantCreatives.forEach(creative => {
      creative.campaignName.split(' | ').forEach(campaign => {
        const trimmed = campaign.trim()
        if (trimmed) campaigns.add(trimmed)
      })
    })
    
    const result = Array.from(campaigns).sort()
    console.log(`getUniqueCampaigns: ${result.length} campaigns (accounts: [${selectedAccounts?.join(', ') || 'all'}], date: "${dateFilter}")`)
    return result
  }

  const getUniqueDeliveryStatuses = () => {
    const statuses = new Set<string>()

    // Start with date-filtered creatives
    let relevantCreatives = mergedCreatives.filter(creative =>
      matchesDateFilter(creative, dateFilter, customDateRange)
    )

    // Apply current filters to get relevant statuses
    if (accountFilter !== null && accountFilter.length > 0) {
      relevantCreatives = relevantCreatives.filter(creative => {
        const accounts = creative.accountName.split(' | ').map(account => account.trim())
        return accountFilter.some(selectedAccount => accounts.includes(selectedAccount))
      })
    }

    if (campaignFilter !== null && campaignFilter.length > 0) {
      relevantCreatives = relevantCreatives.filter(creative => {
        const campaigns = creative.campaignName.split(' | ').map(campaign => campaign.trim())
        return campaignFilter.some(selectedCampaign => campaigns.includes(selectedCampaign))
      })
    }

    // Extract unique delivery statuses from filtered creatives
    relevantCreatives.forEach(creative => {
      if (creative.campaignStatus && creative.campaignStatus.trim()) {
        statuses.add(creative.campaignStatus.trim())
      }
    })

    const result = Array.from(statuses).sort()
    console.log(`getUniqueDeliveryStatuses: ${result.length} delivery statuses`)
    return result
  }

  const getUniqueWorkflowStatuses = () => {
    const statuses = new Set<string>()

    // Start with date-filtered creatives
    let relevantCreatives = mergedCreatives.filter(creative =>
      matchesDateFilter(creative, dateFilter, customDateRange)
    )

    // Apply current filters to get relevant workflow statuses
    if (accountFilter !== null && accountFilter.length > 0) {
      relevantCreatives = relevantCreatives.filter(creative => {
        const accounts = creative.accountName.split(' | ').map(account => account.trim())
        return accountFilter.some(selectedAccount => accounts.includes(selectedAccount))
      })
    }

    if (campaignFilter !== null && campaignFilter.length > 0) {
      relevantCreatives = relevantCreatives.filter(creative => {
        const campaigns = creative.campaignName.split(' | ').map(campaign => campaign.trim())
        return campaignFilter.some(selectedCampaign => campaigns.includes(selectedCampaign))
      })
    }

    // Extract unique library statuses from filtered creatives
    relevantCreatives.forEach(creative => {
      if (creative.libraryStatus && creative.libraryStatus.trim()) {
        statuses.add(creative.libraryStatus.trim())
      }
    })

    const result = Array.from(statuses).sort()
    console.log(`getUniqueWorkflowStatuses: ${result.length} workflow statuses`)
    return result
  }

  const uniqueAccounts = useMemo(() => getUniqueAccounts(), [mergedCreatives, dateFilter, customDateRange])
  const uniqueCampaigns = useMemo(() => getUniqueCampaigns(accountFilter), [mergedCreatives, accountFilter, dateFilter, customDateRange])
  const uniqueDeliveryStatuses = useMemo(() => getUniqueDeliveryStatuses(), [mergedCreatives, dateFilter, customDateRange, accountFilter, campaignFilter])
  const uniqueWorkflowStatuses = useMemo(() => getUniqueWorkflowStatuses(), [mergedCreatives, dateFilter, customDateRange, accountFilter, campaignFilter])



  // Get performance metrics from grouped creative aggregated data
  const getLatestMetrics = (entry: GroupedCreative) => {
    return {
      cost: entry.aggregatedMetrics.totalCost,
      cpl: entry.aggregatedMetrics.avgCostPerLead,
      cpc: entry.aggregatedMetrics.avgCPC,
      leads: entry.aggregatedMetrics.totalLeads,
      clicks: entry.aggregatedMetrics.totalClicks,
      adSets: entry.aggregatedMetrics.uniqueAdSets,
      historyCount: entry.aggregatedMetrics.historyCount,
      date: entry.lastUpdated.toISOString()
    }
  }

  // Handle opening the creative preview panel
  const handleViewCreative = (creative: GroupedCreative) => {
    setSelectedCreative(creative)
    setIsCreativePreviewOpen(true)
  }

  // Handle closing the creative preview panel
  const handleCloseCreativePreview = () => {
    setIsCreativePreviewOpen(false)
    // Delay clearing the selected creative to allow for panel animation
    setTimeout(() => {
      setSelectedCreative(null)
    }, 300)
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="px-8 py-8">
        {/* Title + Metrics */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-league-spartan text-3xl text-gray-900 font-bold">Creative Stream</h1>
            <p className="text-gray-600 text-sm mt-1">Live feed of daily creative logs from Google Sheets</p>
          </div>

          {sheetsData && (
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Total Records: <span className="text-gray-900">{sheetsData.stats.totalRecords.toLocaleString()}</span></span>
                <span>•</span>
                <span>Unique Creatives: <span className="text-gray-900">{sheetsData.mergedCreatives.length.toLocaleString()}</span></span>
                <span>•</span>
                {isLoading || isRefreshing ? (
                  <span className="flex items-center gap-1.5">
                    <span>Loading...</span>
                  </span>
                ) : lastFetchTime && (
                  <span>Updated: {new Date(lastFetchTime).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters Row */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-start gap-3">
            <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <FloatingInput
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="pl-10 w-72"
              />
            </div>

            {/* Date Filter */}
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 py-0 px-3 w-auto min-w-[120px] flex-shrink-0 text-[13px]">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>{formatDateRange(dateFilter, customDateRange)}</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <div className="flex">
                  {/* Presets Sidebar */}
                  <div className="border-r bg-gray-50/50 p-3 w-40">
                    <div className="text-sm font-medium text-gray-900 mb-3">Date Range</div>
                    <div className="space-y-1">
                      {datePresets.map((preset) => (
                        <button
                          key={preset.key}
                          onClick={() => {
                            setDateFilter(preset.key)
                            if (preset.key !== 'all') {
                              const range = getDateRangeFromPreset(preset.key)
                              setCustomDateRange(range)
                            } else {
                              setCustomDateRange({ from: null, to: null })
                            }
                            setShowDatePicker(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                            dateFilter === preset.key ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                      <hr className="my-2" />
                      <button
                        onClick={() => setDateFilter('custom')}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                          dateFilter === 'custom' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        Custom Range
                      </button>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="p-3">
                    {dateFilter === 'custom' ? (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-900">Select Custom Range</div>
                        <Calendar
                          mode="range"
                          showOutsideDays={false}
                          selected={{
                            from: customDateRange.from || undefined,
                            to: customDateRange.to || undefined
                          }}
                          onSelect={(range) => {
                            if (range) {
                              setCustomDateRange({
                                from: range.from || null,
                                to: range.to || range.from || null
                              })
                            }
                          }}
                          disabled={(date) => {
                            // Disable future dates (dates after today in Central Time)
                            const today = toCT(new Date()).toJSDate()
                            today.setHours(23, 59, 59, 999) // End of today
                            return date > today
                          }}
                          numberOfMonths={2}
                          className="rounded-md border"
                        />
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setShowDatePicker(false)
                            }}
                            disabled={!customDateRange.from}
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCustomDateRange({ from: null, to: null })
                              setDateFilter('all')
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <div className="text-sm font-medium">Preview</div>
                        <div className="text-xs mt-1">
                          {dateFilter === 'all' ? 'All data will be shown' : `Showing data for: ${formatDateRange(dateFilter, customDateRange)}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Account Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 py-0 px-3 w-auto min-w-[120px] flex-shrink-0 text-[13px]">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {accountFilter === null || accountFilter.length === 0
                      ? (dateFilter !== 'all'
                          ? `All Accounts (Filtered by date: ${dateFilter === 'custom' ? 'Custom Range' : dateFilter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())})`
                          : 'All Accounts')
                      : accountFilter.length === 1
                      ? accountFilter[0]
                      : `${accountFilter.length} Accounts Selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-accounts"
                        checked={accountFilter === null || accountFilter.length === uniqueAccounts.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAccountFilter(null)
                          } else {
                            setAccountFilter([])
                          }
                        }}
                      />
                      <label htmlFor="select-all-accounts" className="text-sm font-medium">
                        All Accounts
                      </label>
                    </div>

                    {/* Always show divider line below All Accounts */}
                    <div className="border-t border-gray-200 my-3"></div>

                    {/* Selected items section */}
                    {accountFilter && accountFilter.length > 0 && (
                      <>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          SELECTED ({accountFilter.length})
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="space-y-1 mb-4">
                            {accountFilter.map((selectedAccount) => (
                              <div key={`selected-${selectedAccount}`} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
                                <Checkbox
                                  id={`selected-account-${selectedAccount}`}
                                  checked={true}
                                  onCheckedChange={() => {
                                    setAccountFilter(prev => prev?.filter(a => a !== selectedAccount) || [])
                                  }}
                                />
                                <label htmlFor={`selected-account-${selectedAccount}`} className="text-[13px]">
                                  {selectedAccount}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Divider line */}
                        <div className="border-t border-gray-200 my-3"></div>
                      </>
                    )}

                    {/* All Accounts section */}
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">ALL ACCOUNTS</div>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="space-y-3 mt-2">
                        {uniqueAccounts.filter(account => !accountFilter?.includes(account)).map((account) => (
                          <div key={account} className="flex items-center space-x-2">
                            <Checkbox
                              id={`account-${account}`}
                              checked={false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAccountFilter(prev => [...(prev || []), account])
                                }
                              }}
                            />
                            <label htmlFor={`account-${account}`} className="text-[13px]">
                              {account}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Campaign Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 py-0 px-3 w-auto min-w-[120px] flex-shrink-0 text-[13px]">
                  <Tag className="h-4 w-4 mr-2" />
                  <span>
                    {campaignFilter === null || campaignFilter.length === 0
                      ? (accountFilter && accountFilter.length > 0
                          ? `All Campaigns (Filtered by ${accountFilter.length} account${accountFilter.length > 1 ? 's' : ''})`
                          : 'All Campaigns')
                      : campaignFilter.length === 1
                      ? campaignFilter[0]
                      : `${campaignFilter.length} Campaigns Selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-campaigns"
                        checked={campaignFilter === null || campaignFilter.length === uniqueCampaigns.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCampaignFilter(null)
                          } else {
                            setCampaignFilter([])
                          }
                        }}
                      />
                      <label htmlFor="select-all-campaigns" className="text-sm font-medium">
                        All Campaigns
                      </label>
                    </div>

                    {/* Always show divider line below All Campaigns */}
                    <div className="border-t border-gray-200 my-3"></div>

                    {/* Selected items section */}
                    {campaignFilter && campaignFilter.length > 0 && (
                      <>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          SELECTED ({campaignFilter.length})
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="space-y-1 mb-4">
                            {campaignFilter.map((selectedCampaign) => (
                              <div key={`selected-${selectedCampaign}`} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
                                <Checkbox
                                  id={`selected-campaign-${selectedCampaign}`}
                                  checked={true}
                                  onCheckedChange={() => {
                                    setCampaignFilter(prev => prev?.filter(c => c !== selectedCampaign) || [])
                                  }}
                                />
                                <label htmlFor={`selected-campaign-${selectedCampaign}`} className="text-[13px]">
                                  {selectedCampaign}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Divider line below SELECTED */}
                        <div className="border-t border-gray-200 my-3"></div>
                      </>
                    )}

                    {/* All Campaigns section */}
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">ALL CAMPAIGNS</div>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="space-y-3 mt-2">
                        {uniqueCampaigns.filter(campaign => !campaignFilter?.includes(campaign)).map((campaign) => (
                          <div key={campaign} className="flex items-center space-x-2">
                            <Checkbox
                              id={`campaign-${campaign}`}
                              checked={false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampaignFilter(prev => [...(prev || []), campaign])
                                }
                              }}
                            />
                            <label htmlFor={`campaign-${campaign}`} className="text-[13px]">
                              {campaign}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Status Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 py-0 px-3 w-auto min-w-[120px] flex-shrink-0 text-[13px]">
                  <Activity className="h-4 w-4 mr-2" />
                  <span>
                    {deliveryStatusFilter === null && workflowStatusFilter === null
                      ? ((accountFilter && accountFilter.length > 0) || (campaignFilter && campaignFilter.length > 0)
                          ? `All Status (Filtered by ${(accountFilter?.length || 0) + (campaignFilter?.length || 0)} filter${(accountFilter?.length || 0) + (campaignFilter?.length || 0) > 1 ? 's' : ''})`
                          : 'All Status')
                      : deliveryStatusFilter !== null && workflowStatusFilter === null
                      ? getStatusDisplayName(deliveryStatusFilter)
                      : deliveryStatusFilter === null && workflowStatusFilter !== null
                      ? getStatusDisplayName(workflowStatusFilter)
                      : '2 Status Selected'}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-status"
                        checked={deliveryStatusFilter === null && workflowStatusFilter === null}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDeliveryStatusFilter(null)
                            setWorkflowStatusFilter(null)
                          }
                        }}
                      />
                      <label htmlFor="select-all-status" className="text-sm font-medium">
                        All Status
                      </label>
                    </div>

                    {/* Always show divider line below All Status */}
                    <div className="border-t border-gray-200 my-3"></div>


                    {/* Delivery Status section */}
                    <div className="text-[13px] text-gray-500 uppercase tracking-wide mt-1">DELIVERY STATUS</div>
                    <div className="max-h-32 overflow-y-auto">
                      <RadioGroup
                        value={deliveryStatusFilter || ''}
                        onValueChange={(value) => setDeliveryStatusFilter(value === '' ? null : value)}
                        className="space-y-0"
                      >
                        {uniqueDeliveryStatuses.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={status.toLowerCase()}
                              id={`delivery-status-${status}`}
                            />
                            <label htmlFor={`delivery-status-${status}`} className="text-[13px]">
                              {getStatusDisplayName(status)}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Divider line above Library Status */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Library Status section */}
                    <div className="text-[13px] text-gray-500 uppercase tracking-wide mt-1">LIBRARY STATUS</div>
                    <div className="max-h-32 overflow-y-auto">
                      <RadioGroup
                        value={workflowStatusFilter || ''}
                        onValueChange={(value) => setWorkflowStatusFilter(value === '' ? null : value)}
                        className="space-y-0"
                      >
                        {/* Show Published Only option */}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="show-published-only"
                            id="show-published-only"
                          />
                          <label htmlFor="show-published-only" className="text-[13px]">
                            Show Published Only
                          </label>
                        </div>

                        {/* Show Not Published option */}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="show-not-published"
                            id="show-not-published"
                          />
                          <label htmlFor="show-not-published" className="text-[13px]">
                            Show Not Published
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button - Only show when filters are active */}
            {(searchQuery ||
              dateFilter !== 'all' ||
              (accountFilter && accountFilter.length > 0) ||
              (campaignFilter && campaignFilter.length > 0) ||
              deliveryStatusFilter !== null ||
              workflowStatusFilter !== null) && (
              <button
                className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => {
                  setSearchQuery('')
                  setSearchInput('')
                  setDeliveryStatusFilter(null)
                  setWorkflowStatusFilter(null)
                  setCampaignFilter(null)
                  setAccountFilter(null)
                  setDateFilter('all')
                  setCustomDateRange({ from: null, to: null })
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Clear Filters
              </button>
            )}

            </div>

            {/* Column Management Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 flex-shrink-0 ml-auto">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="end">
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-900">Manage Columns</div>
                      <div className="space-y-2">
                        {/* Required columns (always visible) */}
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Required</div>
                        <div className="flex items-center space-x-2 opacity-50">
                          <Checkbox checked={true} disabled />
                          <label className="text-sm text-gray-600">Image</label>
                        </div>
                        <div className="flex items-center space-x-2 opacity-50">
                          <Checkbox checked={true} disabled />
                          <label className="text-sm text-gray-600">Creative</label>
                        </div>
                        <div className="flex items-center space-x-2 opacity-50">
                          <Checkbox checked={true} disabled />
                          <label className="text-sm text-gray-600">Account</label>
                        </div>
                        <div className="flex items-center space-x-2 opacity-50">
                          <Checkbox checked={true} disabled />
                          <label className="text-sm text-gray-600">Campaign</label>
                        </div>
                        <div className="flex items-center space-x-2 opacity-50">
                          <Checkbox checked={true} disabled />
                          <label className="text-sm text-gray-600">Status</label>
                        </div>

                        {/* Optional columns */}
                        <div className="text-xs text-gray-500 uppercase tracking-wide mt-4">Optional</div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-history"
                            checked={columns.find(col => col.id === 'history')?.isVisible || false}
                            onCheckedChange={(checked) => toggleColumn('history')}
                          />
                          <label htmlFor="col-history" className="text-[13px]">History</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-adsets"
                            checked={columns.find(col => col.id === 'adSets')?.isVisible || false}
                            onCheckedChange={(checked) => toggleColumn('adSets')}
                          />
                          <label htmlFor="col-adsets" className="text-[13px]">Ad Sets</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-cost"
                            checked={columns.find(col => col.id === 'cost')?.isVisible || false}
                            onCheckedChange={(checked) => toggleColumn('cost')}
                          />
                          <label htmlFor="col-cost" className="text-[13px]">Cost</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-cpl"
                            checked={columns.find(col => col.id === 'cpl')?.isVisible || false}
                            onCheckedChange={(checked) => toggleColumn('cpl')}
                          />
                          <label htmlFor="col-cpl" className="text-[13px]">CPL</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-cpc"
                            checked={columns.find(col => col.id === 'cpc')?.isVisible || false}
                            onCheckedChange={(checked) => toggleColumn('cpc')}
                          />
                          <label htmlFor="col-cpc" className="text-[13px]">CPC</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-leads"
                            checked={columns.find(col => col.id === 'leads')?.isVisible || false}
                            onCheckedChange={(checked) => toggleColumn('leads')}
                          />
                          <label htmlFor="col-leads" className="text-[13px]">Leads (Website Leads)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="col-clicks"
                            checked={columns.find(col => col.id === 'clicks')?.isVisible || false}
                            onCheckedChange={(checked) => toggleColumn('clicks')}
                          />
                          <label htmlFor="col-clicks" className="text-[13px]">Clicks (Link Clicks)</label>
                        </div>
                      </div>

                      {/* Reset button */}
                      <div className="border-t pt-3 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetColumns}
                          className="w-full justify-start"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset to Defaults
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
          </div>
        </div>

        {/* Filter Tags Display */}
        <FilterTagsDisplay
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          dateFilter={dateFilter}
          onClearDate={() => setDateFilter('all')}
          getDateDisplayName={(dateKey) => {
            const preset = datePresets.find(p => p.key === dateKey)
            return preset?.label || dateKey
          }}
          accountFilter={accountFilter}
          onRemoveAccount={(account) => {
            if (accountFilter) {
              const newFilter = accountFilter.filter(a => a !== account)
              setAccountFilter(newFilter.length > 0 ? newFilter : null)
            }
          }}
          campaignFilter={campaignFilter}
          onRemoveCampaign={(campaign) => {
            if (campaignFilter) {
              const newFilter = campaignFilter.filter(c => c !== campaign)
              setCampaignFilter(newFilter.length > 0 ? newFilter : null)
            }
          }}
          deliveryStatusFilter={deliveryStatusFilter}
          onRemoveDeliveryStatus={(status) => {
            setDeliveryStatusFilter(null)
          }}
          workflowStatusFilter={workflowStatusFilter}
          onRemoveWorkflowStatus={(status) => {
            setWorkflowStatusFilter(null)
          }}
          getStatusDisplayName={getStatusDisplayName}
        />

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger variant="outline" size="sm" className="h-9 px-3 w-auto min-w-[180px] flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest → Oldest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest → Newest)</SelectItem>
                <SelectItem value="cost-desc">Cost (High → Low)</SelectItem>
                <SelectItem value="cost-asc">Cost (Low → High)</SelectItem>
                <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z → A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {filtering && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Filtering...</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                <SelectTrigger variant="outline" size="sm" className="h-9 px-3 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-gray-600">Loading data from Google Sheets...</div>
              </div>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="py-12">
              <Alert>
                <div className="text-red-600">
                  Failed to load data: {error?.message || 'Unknown error'}
                </div>
              </Alert>
            </CardContent>
          </Card>
        ) : !sheetsData || sheetsData.mergedCreatives.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-600">
                No data available. Please check your Google Sheets connection.
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-50 border-b">
                    <TableRow className="h-12">
                      {visibleColumns.map((column) => {
                        const getStickyHeaderClass = (columnId: string) => {
                          if (columnId === 'actions') return 'sticky left-0 z-10 bg-gray-50'
                          if (columnId === 'image') return 'sticky left-12 z-10 bg-gray-50'
                          return ''
                        }

                        return (
                          <TableHead
                            key={column.id}
                            className={`font-league-spartan px-4 text-xs text-black uppercase tracking-wide ${
                              column.id === 'actions' ? 'px-2 w-12' :
                              column.id === 'image' ? 'w-20' :
                              ['history', 'adSets', 'cost', 'cpl', 'cpc', 'leads', 'clicks', 'status'].includes(column.id) ? 'text-center' : ''
                            } ${getStickyHeaderClass(column.id)} ${column.width || ''}`}
                          >
                            {column.label}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCreatives.map((creative) => {
                      const metrics = getLatestMetrics(creative)

                      return (
                        <TableRow
                          key={creative.imageAssetId}
                          className="h-16 hover:bg-blue-50 transition-colors border-b border-gray-100 group cursor-pointer"
                          onClick={() => handleViewCreative(creative)}
                        >
                          {visibleColumns.map((column) =>
                            renderTableCell(column.id, creative, metrics, {
                              onEditClick: () => handleViewCreative(creative)
                            })
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()} results
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="mx-3 text-sm text-gray-600">
                    {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Creative Preview Panel */}
        {selectedCreative && (
          <CreativePreviewPanel
            creative={selectedCreative}
            isOpen={isCreativePreviewOpen}
            onClose={handleCloseCreativePreview}
            allCreatives={mergedCreatives}
          />
        )}
      </div>
    </div>
  )
}
