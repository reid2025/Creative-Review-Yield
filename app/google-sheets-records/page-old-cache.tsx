'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Database,
  RefreshCw,
  ImageOff,
  Plus,
  Check,
  CheckCircle2
} from 'lucide-react'

// Custom Components
import { ImageHoverPreview } from '@/components/ImageHoverPreview'
import { PerformanceHoverCard } from '@/components/PerformanceHoverCard'

interface GoogleSheetRow {
  [key: string]: string
}

interface CreativeHistoryEntry {
  date: string
  cost: string
  costPerWebsiteLead: string
  costPerLinkClick: string
  dataSource: 'google-sheets' | 'manual'
}

interface MergedCreative {
  uniqueKey: string
  accountName: string
  campaignName: string
  imageAssetName: string
  imageUrl?: string
  litigationName?: string
  campaignType?: string
  designer?: string
  startDate?: string
  endDate?: string
  markedAsTopAd?: boolean
  optimizationValue?: boolean
  history: CreativeHistoryEntry[]
  firstSeen: Date
  lastUpdated: Date
  recordCount: number
  savedInLibrary?: boolean
  libraryStatus?: 'draft' | 'saved'
}

// Google Sheets configuration
const SPREADSHEET_ID = '1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc'
const RANGE = 'A:Z'

declare global {
  interface Window {
    gapi: {
      client: {
        request: (config: Record<string, unknown>) => Promise<{result: {values?: string[][]}, status?: number}>
      }
    }
  }
}

export default function AddCreativesPage() {
  const { user } = useGoogleAuth()
  const router = useRouter()
  
  // Use TanStack Query for data fetching and caching
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
  const [mergedCreatives, setMergedCreatives] = useState<MergedCreative[]>([])
  const [filteredCreatives, setFilteredCreatives] = useState<MergedCreative[]>([])
  const [filtering, setFiltering] = useState(false)
  const [selectedCreative, setSelectedCreative] = useState<MergedCreative | null>(null)
  const [savedCreativeUrls, setSavedCreativeUrls] = useState<Set<string>>(new Set())
  const [creativeStatuses, setCreativeStatuses] = useState<Map<string, 'draft' | 'saved'>>(new Map())
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Update merged creatives when data changes
  useEffect(() => {
    const updateData = async () => {
      if (!sheetsData) return
      
      // Check Firebase for saved status
      const { urls: savedUrls, statuses: statusMap } = await checkSavedCreatives()
      
      const mergedWithStatus = sheetsData.mergedCreatives.map((creative: MergedCreative) => {
        const isSaved = savedUrls.has(creative.imageUrl || '') || savedUrls.has(creative.imageAssetName)
        let status: 'draft' | 'saved' | undefined
        
        if (isSaved) {
          status = statusMap.get(creative.imageUrl || '') || 
                  statusMap.get(creative.imageAssetName) || 
                  'draft'
        }
        
        return {
          ...creative,
          savedInLibrary: isSaved,
          libraryStatus: status
        }
      })
      
      setMergedCreatives(mergedWithStatus)
      setFilteredCreatives(mergedWithStatus)
    }
    
    updateData()
  }, [sheetsData])

  // Function to check which creatives are saved in Firebase and their status
  const checkSavedCreatives = async () => {
    try {
      const creativesRef = collection(db, 'creatives')
      const snapshot = await getDocs(query(creativesRef))
      
      const savedUrls = new Set<string>()
      const savedFilenames = new Set<string>()
      const statusMap = new Map<string, 'draft' | 'saved'>()
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        const status = data.status || 'draft'
        
        // Check by creative filename (most reliable)
        if (data.creativeFilename) {
          savedFilenames.add(data.creativeFilename)
          statusMap.set(data.creativeFilename, status)
        }
        if (data.formData?.creativeFilename) {
          savedFilenames.add(data.formData.creativeFilename)
          statusMap.set(data.formData.creativeFilename, status)
        }
        
        // Also check by image URL
        if (data.imageUrl) {
          savedUrls.add(data.imageUrl)
          statusMap.set(data.imageUrl, status)
        }
        
        // Check if there's a Facebook image URL in formData
        const imageUrlFromForm = data.formData?.imageUrl
        if (imageUrlFromForm && imageUrlFromForm.includes('facebook.com')) {
          savedUrls.add(imageUrlFromForm)
          statusMap.set(imageUrlFromForm, status)
        }
      })
      
      // Store both sets for checking
      setSavedCreativeUrls(new Set([...savedUrls, ...savedFilenames]))
      setCreativeStatuses(statusMap)
      return { urls: new Set([...savedUrls, ...savedFilenames]), statuses: statusMap }
    } catch (error) {
      console.error('Error checking saved creatives:', error)
      return { urls: new Set<string>(), statuses: new Map() }
    }
  }

  const loadAndMergeData = async (forceRefresh = false) => {
    if (!user) {
      toast.error('Please sign in to load data')
      return
    }

    // Check if gapi is ready
    if (!window.gapi || !window.gapi.client) {
      toast.error('Google API not ready. Please refresh the page.')
      return
    }

    if (forceRefresh) {
      setIsRefreshing(true)
    } else {
      setLoading(true)
    }
    
    try {
      // Fetch data directly from Google Sheets
      const response = await window.gapi.client.request({
        path: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`,
        method: 'GET',
      })

      if (!response.result.values || response.result.values.length === 0) {
        toast.error('No data found in spreadsheet')
        setLoading(false)
        return
      }

      const values = response.result.values
      const headers = values[0]
      const rows = values.slice(1)

      // Convert to objects
      const rawData: GoogleSheetRow[] = rows.map(row => {
        const obj: GoogleSheetRow = {}
        headers.forEach((header, index) => {
          obj[header] = row[index] || ''
        })
        return obj
      })

      setGoogleSheetsData(rawData)
      
      // Merge duplicates
      const merged = mergeCreatives(rawData)
      
      // Sort by lastUpdated date (latest first)
      merged.sort((a, b) => {
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      })
      
      // Check which creatives are already saved in Firebase
      const { urls: savedUrls, statuses: statusMap } = await checkSavedCreatives()
      
      // Mark creatives that are saved in library with their status
      const mergedWithStatus = merged.map(creative => {
        const isSaved = savedUrls.has(creative.imageUrl || '') || savedUrls.has(creative.imageAssetName)
        let status: 'draft' | 'saved' | undefined
        
        if (isSaved) {
          // Get the status from the map
          status = statusMap.get(creative.imageUrl || '') || 
                  statusMap.get(creative.imageAssetName) || 
                  'draft'
        }
        
        return {
          ...creative,
          savedInLibrary: isSaved,
          libraryStatus: status
        }
      })
      
      setMergedCreatives(mergedWithStatus)
      setFilteredCreatives(mergedWithStatus)
      
      // Update stats
      setStats({
        totalRecords: rawData.length,
        uniqueCreatives: mergedWithStatus.length
      })
      
      // Save to IndexedDB cache (can handle larger datasets)
      try {
        const cacheData = {
          mergedCreatives: mergedWithStatus,
          stats: {
            totalRecords: rawData.length,
            uniqueCreatives: mergedWithStatus.length
          }
        }
        
        // Save to IndexedDB (5 minute expiry)
        await cacheService.set('googleSheetsData', cacheData, 5)
        setLastFetchTime(new Date())
      } catch (cacheError) {
        // If cache fails, just continue without caching
        console.warn('Cache storage failed, continuing without cache:', cacheError)
        setLastFetchTime(new Date())
      }
      
      toast.success(`Loaded ${rawData.length} records, merged into ${merged.length} unique creatives`)
    } catch (error) {
      console.error('Error loading data from Google Sheets:', error)
      toast.error('Failed to load data from Google Sheets. Please check your access.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Merge function to combine duplicates based on Image URL only
  const mergeCreatives = (data: GoogleSheetRow[]): MergedCreative[] => {
    const mergedMap = new Map<string, MergedCreative>()
    
    data.forEach((row) => {
      // Generate unique key based on Image URL only
      // This will merge all records with the same image regardless of account/campaign
      const imageUrl = row['Image asset URL'] || ''
      if (!imageUrl) return // Skip records without image URL
      
      const key = imageUrl.toLowerCase()
      
      // Create history entry from this row
      const historyEntry: CreativeHistoryEntry = {
        date: row['Date'] || new Date().toISOString(),
        cost: row['Cost'] || '0',
        costPerWebsiteLead: row['Cost per website lead'] || '0',
        costPerLinkClick: row['CPC (cost per link click)'] || '0',
        dataSource: 'google-sheets'
      }
      
      if (mergedMap.has(key)) {
        // Update existing creative - merge data from different accounts/campaigns
        const existing = mergedMap.get(key)!
        existing.history.push(historyEntry)
        existing.recordCount++
        existing.lastUpdated = new Date(row['Date'] || new Date())
        
        // Combine account names if different
        if (!existing.accountName.includes(row['Account name'])) {
          existing.accountName += ` | ${row['Account name']}`
        }
        
        // Combine campaign names if different
        if (!existing.campaignName.includes(row['Campaign name'])) {
          existing.campaignName += ` | ${row['Campaign name']}`
        }
      } else {
        // Create new merged creative
        const merged: MergedCreative = {
          uniqueKey: key,
          accountName: row['Account name'] || '',
          campaignName: row['Campaign name'] || '',
          imageAssetName: row['Image asset name'] || '',
          imageUrl: row['Image asset URL'],
          litigationName: extractLitigation(row['Campaign name']),
          campaignType: extractCampaignType(row['Campaign name']),
          history: [historyEntry],
          firstSeen: new Date(row['Date'] || new Date()),
          lastUpdated: new Date(row['Date'] || new Date()),
          recordCount: 1,
          markedAsTopAd: false, // Will be set based on performance
          optimizationValue: false
        }
        mergedMap.set(key, merged)
      }
    })
    
    // Sort history by date for each creative
    mergedMap.forEach((creative) => {
      creative.history.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
    })
    
    return Array.from(mergedMap.values())
  }

  // Extract litigation name from campaign name
  const extractLitigation = (campaignName: string): string => {
    if (!campaignName) return ''
    const parts = campaignName.split('/')
    if (parts.length > 0) {
      return parts[0].trim()
    }
    return campaignName
  }

  // Extract campaign type from campaign name
  const extractCampaignType = (campaignName: string): string => {
    if (!campaignName) return ''
    const lowerCase = campaignName.toLowerCase()
    if (lowerCase.includes('social')) return 'Social Media'
    if (lowerCase.includes('search')) return 'Search'
    if (lowerCase.includes('display')) return 'Display'
    if (lowerCase.includes('video')) return 'Video'
    return 'Other'
  }

  // Handle search input with debounce
  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    setFiltering(true)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for 2 seconds
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value)
      setFiltering(false)
    }, 2000)
  }
  
  // Apply filters
  useEffect(() => {
    setFiltering(true)
    
    // Add small delay to show loading state
    const filterTimeout = setTimeout(() => {
      let filtered = [...mergedCreatives]
      
      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(c => 
          c.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.imageAssetName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Sort by lastUpdated date (latest first)
      filtered.sort((a, b) => {
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      })
      
      setFilteredCreatives(filtered)
      setFiltering(false)
    }, 100)
    
    return () => clearTimeout(filterTimeout)
  }, [searchQuery, mergedCreatives])


  // Handle selecting a creative
  const handleSelectCreative = (creative: MergedCreative) => {
    setSelectedCreative(creative)
  }

  // Clear cache function (useful for debugging)
  const clearCache = async () => {
    try {
      await cacheService.clear()
      toast.info('Cache cleared. Data will be fetched fresh on next load.')
    } catch (error) {
      console.error('Error clearing cache:', error)
      toast.error('Failed to clear cache')
    }
  }

  // Handle adding or editing selected creative
  const handleAddCreative = async () => {
    if (!selectedCreative) return
    
    // Always store the latest Google Sheets data in sessionStorage
    // This ensures we have the latest performance history
    sessionStorage.setItem('googleSheetCreative', JSON.stringify({
      imageUrl: selectedCreative.imageUrl,
      imageAssetName: selectedCreative.imageAssetName,
      accountName: selectedCreative.accountName,
      campaignName: selectedCreative.campaignName,
      litigationName: selectedCreative.litigationName,
      history: selectedCreative.history
    }))
    
    // If creative is already saved, find its ID for editing
    if (selectedCreative.savedInLibrary) {
      try {
        // Find the creative in Firebase by image asset name
        const creativesRef = collection(db, 'creatives')
        const snapshot = await getDocs(query(creativesRef))
        
        let creativeId: string | null = null
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Match by creative filename or image URL
          if (data.creativeFilename === selectedCreative.imageAssetName || 
              data.imageUrl === selectedCreative.imageUrl ||
              data.formData?.creativeFilename === selectedCreative.imageAssetName) {
            creativeId = doc.id
          }
        })
        
        if (creativeId) {
          // Navigate to edit mode with the creative ID
          router.push(`/upload/single?edit=${creativeId}&from=google-sheets`)
          return
        }
      } catch (error) {
        console.error('Error finding creative for edit:', error)
        toast.error('Could not find creative for editing')
      }
    }
    
    // If not saved, create new
    router.push('/upload/single?from=google-sheets')
  }

  // Get latest performance metrics (based on most recent date)
  const getLatestMetrics = (creative: MergedCreative) => {
    // Sort history by date to get the truly latest entry
    const sortedHistory = [...creative.history].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    const latest = sortedHistory[0] // Get the most recent by date
    return {
      cost: parseFloat(latest?.cost || '0'),
      cpl: parseFloat(latest?.costPerWebsiteLead || '0'),
      cpc: parseFloat(latest?.costPerLinkClick || '0'),
      date: latest?.date || new Date().toISOString()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-4">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Google Sheets Records</h1>
              </div>
              <p className="text-sm text-gray-600">
                Real-time data from your Google Sheets database
              </p>
            </div>
            
            {/* Stats and Actions */}
            <div className="flex items-center gap-2">
              {lastFetchTime && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Last updated: {format(lastFetchTime, 'h:mm a')}</span>
                </div>
              )}
              {selectedCreative && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddCreative}
                  className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span className="ml-2">
                    {selectedCreative.savedInLibrary ? 'Edit Creative' : 'Add Creative'}
                  </span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAndMergeData(true)}
                disabled={loading || isRefreshing}
                className="h-8"
                title={lastFetchTime ? `Last updated: ${format(lastFetchTime, 'MMM d, h:mm a')}` : ''}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
              <Badge variant="outline" className="text-xs py-1 px-2">
                {stats.totalRecords.toLocaleString()} records
              </Badge>
              <Badge variant="secondary" className="text-xs py-1 px-2">
                {stats.uniqueCreatives.toLocaleString()} unique
              </Badge>
            </div>
          </div>
        </div>

        {/* Search Filter Only */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search creatives..."
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {searchInput && searchInput !== searchQuery && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      {/* Data Table */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-gray-600">Loading data from Google Sheets...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredCreatives.length > 0 ? (
        <Card className="flex-1 relative">
          <CardContent className="p-0">
            {/* Loading overlay while filtering */}
            {filtering && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Filtering creatives...</p>
                </div>
              </div>
            )}
            <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 border-b">
                    <TableRow className="h-10">
                      <TableHead className="w-12 px-2 text-xs text-center">Select</TableHead>
                      <TableHead className="w-16 px-2 text-xs">Image</TableHead>
                      <TableHead className="px-2 text-xs min-w-[150px]">Account</TableHead>
                      <TableHead className="px-2 text-xs min-w-[250px]">Campaign</TableHead>
                      <TableHead className="px-2 text-xs w-20 text-center">History</TableHead>
                      <TableHead className="px-2 text-xs min-w-[180px]">Performance</TableHead>
                      <TableHead className="px-2 text-xs w-24 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreatives.map((creative, index) => {
                      const metrics = getLatestMetrics(creative)
                      const isSelected = selectedCreative?.uniqueKey === creative.uniqueKey
                      
                      return (
                        <TableRow 
                          key={creative.uniqueKey} 
                          className={`h-14 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 hover:bg-blue-100' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectCreative(creative)}
                        >
                          <TableCell className="px-2 w-12">
                            <div className="flex items-center justify-center">
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-2">
                            {creative.imageUrl ? (
                              <ImageHoverPreview
                                src={creative.imageUrl}
                                alt={creative.imageAssetName}
                                className="h-10 w-10 object-cover rounded cursor-pointer border hover:border-blue-500"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                <ImageOff className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-2 text-xs font-medium">{creative.accountName}</TableCell>
                          <TableCell className="px-2">
                            <div className="space-y-0.5">
                              <div className="text-xs font-medium line-clamp-1">{creative.campaignName}</div>
                              {creative.litigationName && (
                                <div className="text-[10px] text-gray-500 line-clamp-1">{creative.litigationName}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 text-center">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                              {creative.history.length} entries
                            </Badge>
                          </TableCell>
                          <TableCell className="px-2">
                            <PerformanceHoverCard history={creative.history}>
                              <div className="space-y-1 cursor-pointer">
                                <div className="flex gap-2.5 items-center">
                                  <div className="text-[11px]">
                                    <span className="text-gray-500">$</span>
                                    <span className="font-medium">{metrics.cost.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[11px]">
                                    <span className="text-gray-500">CPL:</span>
                                    <span className="font-medium">${metrics.cpl.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[11px]">
                                    <span className="text-gray-500">CPC:</span>
                                    <span className="font-medium">${metrics.cpc.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div className="text-[9px] text-gray-400">
                                  {format(new Date(metrics.date), 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </PerformanceHoverCard>
                          </TableCell>
                          <TableCell className="px-2 text-center">
                            {creative.savedInLibrary ? (
                              creative.libraryStatus === 'saved' ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Saved
                                  </Badge>
                                  <span className="text-[9px] text-gray-500">+ Creatives</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                  <Badge className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5">
                                    Draft
                                  </Badge>
                                  <span className="text-[9px] text-gray-500">+ Creatives</span>
                                </div>
                              )
                            ) : (
                              <span className="text-[10px] text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative">
          {/* Loading overlay while filtering */}
          {filtering && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Searching...</p>
              </div>
            </div>
          )}
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchInput ? 'No matching creatives' : 'No data available'}
            </h3>
            <p className="text-gray-600">
              {searchInput
                ? 'Try adjusting your search query'
                : 'Sync data from Google Sheets first'}
            </p>
          </CardContent>
        </Card>
      )}

      </div>
    </div>
  )
}