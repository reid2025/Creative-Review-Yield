'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { format } from 'date-fns'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { toast } from 'sonner'
import type { Creative } from '@/types/creative'
import { PerformanceHoverCard } from '@/components/PerformanceHoverCard'

// UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import CreativePreviewModal from '@/components/CreativePreviewModal'

// Icons
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  ArrowUpDown,
  Grid3X3,
  TableIcon,
  ImageIcon
} from 'lucide-react'

export default function CreativesPage() {
  const { user } = useGoogleAuth()
  const router = useRouter()
  
  // State
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [filteredCreatives, setFilteredCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCreatives, setSelectedCreatives] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof Creative>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  
  // Filters
  const [filterLitigation, setFilterLitigation] = useState<string>('all')
  const [filterCampaign, setFilterCampaign] = useState<string>('all')
  const [filterDesigner, setFilterDesigner] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCreativeForView, setSelectedCreativeForView] = useState<Creative | null>(null)

  // Fetch creatives from Firebase and filter for saved only
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'creatives'),
      orderBy('lastSaved', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const creativesData: Creative[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        // Only include saved creatives (filter in memory)
        if (data.status === 'saved') {
          creativesData.push({
            id: doc.id,
            ...data.formData,
            imageUrl: data.imageUrl,
            status: data.status,
            createdAt: data.createdAt,
            lastSaved: data.lastSaved,
            creativeHistory: data.creativeHistory,
            syncSource: data.syncSource,
            lastSyncedAt: data.lastSyncedAt
          } as Creative)
        }
      })
      setCreatives(creativesData)
      setFilteredCreatives(creativesData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching creatives:', error)
      toast.error('Failed to load creatives')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Get unique values for filters
  const uniqueLitigations = useMemo(() => {
    return Array.from(new Set(creatives.map(c => c.litigationName).filter(Boolean)))
  }, [creatives])

  const uniqueCampaigns = useMemo(() => {
    return Array.from(new Set(creatives.map(c => c.campaignType).filter(Boolean)))
  }, [creatives])

  const uniqueDesigners = useMemo(() => {
    return Array.from(new Set(creatives.map(c => c.designer).filter(Boolean)))
  }, [creatives])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...creatives]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.creativeFilename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.litigationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.campaignType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.headlineText?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Litigation filter
    if (filterLitigation !== 'all') {
      filtered = filtered.filter(c => c.litigationName === filterLitigation)
    }

    // Campaign filter
    if (filterCampaign !== 'all') {
      filtered = filtered.filter(c => c.campaignType === filterCampaign)
    }

    // Designer filter
    if (filterDesigner !== 'all') {
      filtered = filtered.filter(c => c.designer === filterDesigner)
    }

    // No status filter needed - all items here are saved creatives

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField] || ''
      const bVal = b[sortField] || ''
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredCreatives(filtered)
  }, [creatives, searchQuery, filterLitigation, filterCampaign, filterDesigner, sortField, sortDirection])

  // Handle selection
  const handleSelectCreative = (id: string) => {
    const newSelected = new Set(selectedCreatives)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCreatives(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedCreatives.size === filteredCreatives.length) {
      setSelectedCreatives(new Set())
    } else {
      setSelectedCreatives(new Set(filteredCreatives.map(c => c.id)))
    }
  }

  // Handle actions
  const handleStrategySync = () => {
    if (selectedCreatives.size < 3) {
      toast.error('Please select at least 3 creatives for Strategy Sync')
      return
    }
    
    // Pass selected IDs to Strategy Sync page
    const ids = Array.from(selectedCreatives).join(',')
    router.push(`/strategy-sync?creatives=${ids}`)
  }

  const handleDeleteCreative = async (id: string) => {
    if (confirm('Are you sure you want to delete this creative?')) {
      try {
        await deleteDoc(doc(db, 'creatives', id))
        toast.success('Creative deleted successfully')
      } catch (error) {
        console.error('Error deleting creative:', error)
        toast.error('Failed to delete creative')
      }
    }
  }

  const handleSort = (field: keyof Creative) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setFilterLitigation('all')
    setFilterCampaign('all')
    setFilterDesigner('all')
  }

  const activeFilterCount = [
    filterLitigation !== 'all',
    filterCampaign !== 'all',
    filterDesigner !== 'all',
    searchQuery !== ''
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Creatives Library</h1>
        <p className="text-gray-600 mt-2">
          {creatives.length} saved creatives - {filteredCreatives.length} showing
          {selectedCreatives.size > 0 && ' - ' + selectedCreatives.size + ' selected'}
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search creatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <div className="flex gap-2 border-l pl-4">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Litigation</Label>
                <Select value={filterLitigation} onValueChange={setFilterLitigation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Litigations</SelectItem>
                    {uniqueLitigations.map(lit => (
                      <SelectItem key={lit} value={lit as string}>{lit as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Campaign Type</Label>
                <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {uniqueCampaigns.map(camp => (
                      <SelectItem key={camp} value={camp as string}>{camp as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Designer</Label>
                <Select value={filterDesigner} onValueChange={setFilterDesigner}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Designers</SelectItem>
                    {uniqueDesigners.map(designer => (
                      <SelectItem key={designer} value={designer as string}>{designer as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All
                </Button>
              </div>
            </div>
            
          </Card>
        )}
      </div>

      {/* Selection Bar */}
      {selectedCreatives.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {selectedCreatives.size} creatives selected
            </Badge>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSelectedCreatives(new Set())}
            >
              Clear selection
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleStrategySync}
              disabled={selectedCreatives.size < 3}
            >
              Analyze in Strategy Sync
              {selectedCreatives.size < 3 && ' (need 3+)'}
            </Button>
          </div>
        </div>
        
      )}

      {/* Content Area */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')}>
        {/* Table View */}
        <TabsContent value="table">
          {filteredCreatives.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No creatives found</h2>
              <p className="text-gray-600">
                {creatives.length === 0 
                  ? 'Start by uploading your first creative.'
                  : 'Try adjusting your filters or search query.'}
              </p>
            </Card>
          ) : (
            <Card>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCreatives.size === filteredCreatives.length && filteredCreatives.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('creativeFilename')}
                      >
                        <div className="flex items-center">
                          Filename
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('litigationName')}
                      >
                        <div className="flex items-center">
                          Litigation
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Designer</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col">
                          <span>Performance Metrics</span>
                          <div className="flex gap-4 text-xs text-gray-500 mt-1">
                            <span>Spend</span>
                            <span>CPC</span>
                            <span>CPL</span>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreatives.map((creative) => (
                      <TableRow key={creative.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCreatives.has(creative.id)}
                            onCheckedChange={() => handleSelectCreative(creative.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {creative.imageUrl ? (
                            <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                              <NextImage
                                src={creative.imageUrl}
                                alt={creative.creativeFilename || 'Creative'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {creative.creativeFilename || 'Untitled'}
                        </TableCell>
                        <TableCell>{creative.litigationName || '-'}</TableCell>
                        <TableCell>{creative.campaignType || '-'}</TableCell>
                        <TableCell>{creative.designer || '-'}</TableCell>
                        <TableCell>{creative.startDate || '-'}</TableCell>
                        <TableCell>
                          <PerformanceHoverCard history={creative.creativeHistory}>
                            <div className="flex gap-4 items-center cursor-pointer">
                              <div className="text-sm">
                                <span className="text-gray-500">$</span>
                                <span className="font-medium">{creative.creativeHistory?.[creative.creativeHistory.length - 1]?.cost || '0'}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">$</span>
                                <span className="font-medium">{creative.creativeHistory?.[creative.creativeHistory.length - 1]?.costPerLinkClick || '0'}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">$</span>
                                <span className="font-medium">{creative.creativeHistory?.[creative.creativeHistory.length - 1]?.costPerWebsiteLead || '0'}</span>
                              </div>
                              {creative.creativeHistory && creative.creativeHistory.length > 0 && (
                                <Badge variant="outline" className="text-xs h-5 px-1">
                                  {creative.creativeHistory.length}
                                </Badge>
                              )}
                            </div>
                          </PerformanceHoverCard>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {creative.markedAsTopAd && (
                              <Badge variant="default" className="text-xs">Top Ad</Badge>
                            )}
                            {creative.syncSource === 'google-sheets' ? (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                Synced
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Manual</Badge>
                            )}
                            {creative.creativeHistory && creative.creativeHistory.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {creative.creativeHistory.length} updates
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedCreativeForView(creative)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/upload/single?edit=${creative.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCreative(creative.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          )}
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid">
          {filteredCreatives.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No creatives found</h2>
              <p className="text-gray-600">
                {creatives.length === 0 
                  ? 'Start by uploading your first creative.'
                  : 'Try adjusting your filters or search query.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCreatives.map((creative) => (
                <Card 
                  key={creative.id} 
                  className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedCreatives.has(creative.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedCreatives.has(creative.id)}
                      onCheckedChange={() => handleSelectCreative(creative.id)}
                      className="bg-white shadow-sm"
                    />
                  </div>

                  {/* Top Ad Badge */}
                  {creative.markedAsTopAd && (
                    <Badge className="absolute top-2 right-2 z-10" variant="default">
                      Top Ad
                    </Badge>
                  )}

                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {creative.imageUrl ? (
                      <NextImage
                        src={creative.imageUrl}
                        alt={creative.creativeFilename || 'Creative'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info Overlay */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-sm truncate">
                      {creative.creativeFilename || 'Untitled'}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {creative.litigationName && (
                        <Badge variant="secondary" className="text-xs">
                          {creative.litigationName}
                        </Badge>
                      )}
                      {creative.campaignType && (
                        <Badge variant="outline" className="text-xs">
                          {creative.campaignType}
                        </Badge>
                      )}
                      {creative.syncSource === 'google-sheets' && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                          Synced
                        </Badge>
                      )}
                    </div>
                    <PerformanceHoverCard history={creative.creativeHistory}>
                      <div className="flex justify-between text-xs text-gray-600 cursor-pointer">
                        <span>CPC: ${creative.creativeHistory?.[creative.creativeHistory.length - 1]?.costPerLinkClick || '0'}</span>
                        <span>CPL: ${creative.creativeHistory?.[creative.creativeHistory.length - 1]?.costPerWebsiteLead || '0'}</span>
                      </div>
                    </PerformanceHoverCard>
                    {creative.lastSyncedAt && (
                      <div className="text-xs text-gray-500">
                        Last sync: {format(creative.lastSyncedAt.toDate(), 'MMM dd, HH:mm')}
                      </div>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-70 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCreativeForView(creative)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/upload/single?edit=${creative.id}`)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Creative Preview Modal */}
      {selectedCreativeForView && (
        <CreativePreviewModal
          open={!!selectedCreativeForView}
          onOpenChange={(open) => !open && setSelectedCreativeForView(null)}
          creativeData={selectedCreativeForView}
          mode="view"
        />
      )}
    </div>
  )
}