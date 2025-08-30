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

export default function GoogleSheetsRecordsPage() {
  const { user } = useGoogleAuth()
  const router = useRouter()
  
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
  const [mergedCreatives, setMergedCreatives] = useState<MergedCreative[]>([])
  const [filteredCreatives, setFilteredCreatives] = useState<MergedCreative[]>([])
  const [filtering, setFiltering] = useState(false)
  const [selectedCreative, setSelectedCreative] = useState<MergedCreative | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Update merged creatives when data changes
  useEffect(() => {
    const updateData = async () => {
      if (!sheetsData) return
      
      // Check Firebase for saved status
      const creativesRef = collection(db, 'creatives')
      const snapshot = await getDocs(query(creativesRef))
      
      const savedUrls = new Set<string>()
      const savedFilenames = new Set<string>()
      const statusMap = new Map<string, 'draft' | 'saved'>()
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        const status = data.status || 'draft'
        
        if (data.creativeFilename) {
          savedFilenames.add(data.creativeFilename)
          statusMap.set(data.creativeFilename, status)
        }
        if (data.formData?.creativeFilename) {
          savedFilenames.add(data.formData.creativeFilename)
          statusMap.set(data.formData.creativeFilename, status)
        }
        if (data.imageUrl) {
          savedUrls.add(data.imageUrl)
          statusMap.set(data.imageUrl, status)
        }
        const imageUrlFromForm = data.formData?.imageUrl
        if (imageUrlFromForm && imageUrlFromForm.includes('facebook.com')) {
          savedUrls.add(imageUrlFromForm)
          statusMap.set(imageUrlFromForm, status)
        }
      })
      
      const mergedWithStatus = sheetsData.mergedCreatives.map((creative: MergedCreative) => {
        const isSaved = savedUrls.has(creative.imageUrl || '') || 
                       savedFilenames.has(creative.imageAssetName)
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
  
  // Apply filters
  useEffect(() => {
    setFiltering(true)
    
    const filterTimeout = setTimeout(() => {
      let filtered = [...mergedCreatives]
      
      if (searchQuery) {
        filtered = filtered.filter(c => 
          c.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.imageAssetName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
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
        const creativesRef = collection(db, 'creatives')
        const snapshot = await getDocs(query(creativesRef))
        
        let creativeId: string | null = null
        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.creativeFilename === selectedCreative.imageAssetName || 
              data.imageUrl === selectedCreative.imageUrl ||
              data.formData?.creativeFilename === selectedCreative.imageAssetName) {
            creativeId = doc.id
          }
        })
        
        if (creativeId) {
          // Redirect to creative-details page for editing
          router.push(`/google-sheets-records/creative-details?edit=${creativeId}&from=google-sheets`)
          return
        }
      } catch (error) {
        console.error('Error finding creative for edit:', error)
        toast.error('Could not find creative for editing')
      }
    }
    
    // Redirect to creative-details page for new creative
    router.push('/google-sheets-records/creative-details?from=google-sheets')
  }

  // Get latest performance metrics
  const getLatestMetrics = (creative: MergedCreative) => {
    const sortedHistory = [...creative.history].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    const latest = sortedHistory[0]
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
                onClick={() => refresh()}
                disabled={isLoading || isRefreshing}
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
              {sheetsData && (
                <>
                  <Badge variant="outline" className="text-xs py-1 px-2">
                    {sheetsData.stats.totalRecords.toLocaleString()} records
                  </Badge>
                  <Badge variant="secondary" className="text-xs py-1 px-2">
                    {sheetsData.stats.uniqueCreatives.toLocaleString()} unique
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Filter */}
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
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-gray-600">Loading data from Google Sheets...</p>
              </div>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="py-12">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load data: {error?.message || 'Unknown error'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : filteredCreatives.length > 0 ? (
          <Card className="flex-1 relative">
            <CardContent className="p-0">
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
                      {filteredCreatives.map((creative) => {
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
                  : 'Click refresh to load data from Google Sheets'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}