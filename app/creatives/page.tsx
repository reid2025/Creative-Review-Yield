'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Filter, 
  Search, 
  Grid3X3, 
  List, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Image as ImageIcon,
  CheckSquare,
  Square,
  ArrowUpDown,
  SlidersHorizontal,
  Zap,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'

// Mock data - in production, this would come from Firebase/API
const mockCreatives = [
  {
    id: '1',
    filename: 'ozempic-quiz-v2.png',
    imageUrl: '/placeholder.jpg',
    designer: 'Sarah',
    litigation: 'Ozempic Campaign',
    campaignType: 'Mass Tort',
    layoutType: 'Quiz',
    dateAdded: '2025-08-05',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    amountSpent: 15000,
    costPerClick: 2.45,
    costPerWebsiteLead: 25.50,
    headlineText: 'Are You Eligible for Ozempic Compensation?',
    ctaColor: 'Blue',
    ctaPosition: 'Bottom Center',
    markedAsTopAd: true,
    imageryType: ['Photos', 'Icons'],
    copyAngle: ['Legal', 'Question-based'],
    performance: 'high' // high, medium, low
  },
  {
    id: '2',
    filename: 'personal-injury-banner.png',
    imageUrl: '/placeholder.jpg',
    designer: 'Mike',
    litigation: 'Car Accident - Miami',
    campaignType: 'Personal Injury',
    layoutType: 'Banner',
    dateAdded: '2025-08-04',
    startDate: '2025-07-28',
    endDate: '2025-08-28',
    amountSpent: 8500,
    costPerClick: 3.20,
    costPerWebsiteLead: 45.80,
    headlineText: 'Miami Car Accident? Get Compensation Now',
    ctaColor: 'Red',
    ctaPosition: 'Center',
    markedAsTopAd: false,
    imageryType: ['Photos'],
    copyAngle: ['Urgency', 'Benefit-focused'],
    performance: 'medium'
  },
  {
    id: '3',
    filename: 'sa-campaign-card.png',
    imageUrl: '/placeholder.jpg',
    designer: 'Lisa',
    litigation: 'LA County SA',
    campaignType: 'SA (Sexual Abuse)',
    layoutType: 'Card',
    dateAdded: '2025-08-03',
    startDate: '2025-07-25',
    endDate: '2025-08-25',
    amountSpent: 12000,
    costPerClick: 1.85,
    costPerWebsiteLead: 18.90,
    headlineText: 'Confidential Legal Support Available',
    ctaColor: 'Blue',
    ctaPosition: 'Bottom Right',
    markedAsTopAd: true,
    imageryType: ['Illustrations'],
    copyAngle: ['Empathetic', 'Professional'],
    performance: 'high'
  },
  {
    id: '4',
    filename: 'roundup-video-ad.png',
    imageUrl: '/placeholder.jpg',
    designer: 'John',
    litigation: 'Roundup Litigation',
    campaignType: 'Mass Tort',
    layoutType: 'Video',
    dateAdded: '2025-08-02',
    startDate: '2025-07-20',
    endDate: '2025-08-20',
    amountSpent: 22000,
    costPerClick: 4.10,
    costPerWebsiteLead: 65.20,
    headlineText: 'Roundup Cancer Link - Free Case Review',
    ctaColor: 'Green',
    ctaPosition: 'Top Center',
    markedAsTopAd: false,
    imageryType: ['Video', 'Graphics'],
    copyAngle: ['Educational', 'Medical'],
    performance: 'low'
  },
  {
    id: '5',
    filename: 'wage-claim-carousel.png',
    imageUrl: '/placeholder.jpg',
    designer: 'Alex',
    litigation: 'Wage Claim Campaign',
    campaignType: 'Personal Injury',
    layoutType: 'Carousel',
    dateAdded: '2025-08-01',
    startDate: '2025-07-15',
    endDate: '2025-08-15',
    amountSpent: 9800,
    costPerClick: 2.80,
    costPerWebsiteLead: 32.40,
    headlineText: 'Unpaid Wages? Fight for What You Earned',
    ctaColor: 'Orange',
    ctaPosition: 'Bottom Left',
    markedAsTopAd: true,
    imageryType: ['Photos', 'Graphics'],
    copyAngle: ['Motivational', 'Rights-focused'],
    performance: 'high'
  }
]

// Filter options
const LITIGATION_OPTIONS = ['Ozempic Campaign', 'Car Accident - Miami', 'LA County SA', 'Roundup Litigation', 'Wage Claim Campaign']
const CAMPAIGN_TYPE_OPTIONS = ['Mass Tort', 'Personal Injury', 'SA (Sexual Abuse)']
const DESIGNER_OPTIONS = ['Sarah', 'Mike', 'Lisa', 'John', 'Alex']
const LAYOUT_TYPE_OPTIONS = ['Quiz', 'Banner', 'Card', 'Video', 'Carousel']
const CTA_COLOR_OPTIONS = ['Blue', 'Red', 'Green', 'Orange', 'Yellow', 'Purple']
const PERFORMANCE_OPTIONS = ['High', 'Medium', 'Low']

export default function CreativesPage() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<'table' | 'grid'>('table')
  const [selectedCreatives, setSelectedCreatives] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCreativeForPreview, setSelectedCreativeForPreview] = useState<any>(null)
  
  // Filters
  const [filters, setFilters] = useState({
    litigation: '',
    campaignType: '',
    designer: '',
    layoutType: '',
    ctaColor: '',
    performance: '',
    dateRange: { start: '', end: '' },
    topAdsOnly: false,
    spentMin: '',
    spentMax: '',
    cpcMax: '',
    cplMax: ''
  })

  // Filter and sort creatives
  const filteredCreatives = mockCreatives
    .filter(creative => {
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = 
          creative.filename.toLowerCase().includes(searchLower) ||
          creative.headlineText.toLowerCase().includes(searchLower) ||
          creative.litigation.toLowerCase().includes(searchLower) ||
          creative.designer.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Other filters
      if (filters.litigation && creative.litigation !== filters.litigation) return false
      if (filters.campaignType && creative.campaignType !== filters.campaignType) return false
      if (filters.designer && creative.designer !== filters.designer) return false
      if (filters.layoutType && creative.layoutType !== filters.layoutType) return false
      if (filters.ctaColor && creative.ctaColor !== filters.ctaColor) return false
      if (filters.performance && creative.performance !== filters.performance.toLowerCase()) return false
      if (filters.topAdsOnly && !creative.markedAsTopAd) return false
      if (filters.spentMin && creative.amountSpent < parseInt(filters.spentMin)) return false
      if (filters.spentMax && creative.amountSpent > parseInt(filters.spentMax)) return false
      if (filters.cpcMax && creative.costPerClick > parseFloat(filters.cpcMax)) return false
      if (filters.cplMax && creative.costPerWebsiteLead > parseFloat(filters.cplMax)) return false

      return true
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a]
      let bValue = b[sortBy as keyof typeof b]
      
      if (sortBy === 'dateAdded') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1
      } else {
        return aValue > bValue ? -1 : 1
      }
    })

  const handleSelectCreative = useCallback((creativeId: string) => {
    setSelectedCreatives(prev => 
      prev.includes(creativeId)
        ? prev.filter(id => id !== creativeId)
        : [...prev, creativeId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedCreatives.length === filteredCreatives.length) {
      setSelectedCreatives([])
    } else {
      setSelectedCreatives(filteredCreatives.map(c => c.id))
    }
  }, [selectedCreatives.length, filteredCreatives])

  const clearFilters = () => {
    setFilters({
      litigation: '',
      campaignType: '',
      designer: '',
      layoutType: '',
      ctaColor: '',
      performance: '',
      dateRange: { start: '', end: '' },
      topAdsOnly: false,
      spentMin: '',
      spentMax: '',
      cpcMax: '',
      cplMax: ''
    })
    setSearchQuery('')
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'  
      case 'low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'high': return <TrendingUp className="h-3 w-3" />
      case 'low': return <TrendingDown className="h-3 w-3" />
      default: return null
    }
  }

  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader 
          title="All Creatives"
          description="Browse and manage your uploaded creative assets"
        />

        {/* Search and Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search creatives, headlines, campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-80"
                />
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {Object.values(filters).some(f => f !== '' && f !== false) && (
                  <Badge variant="secondary" className="ml-1">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {/* View Toggle and Actions */}
            <div className="flex items-center space-x-4">
              {selectedCreatives.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {selectedCreatives.length} selected
                  </Badge>
                  <Button variant="default" size="sm" asChild>
                    <Link href="/strategy-sync">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze with Strategy Sync
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedCreatives([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
              
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'grid')}>
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>Table View</span>
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="flex items-center space-x-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span>Visual Grid</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Basic Filters */}
                  <div>
                    <Label>Litigation</Label>
                    <Select value={filters.litigation} onValueChange={(value) => setFilters({...filters, litigation: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All litigations" />
                      </SelectTrigger>
                      <SelectContent>
                        {LITIGATION_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Campaign Type</Label>
                    <Select value={filters.campaignType} onValueChange={(value) => setFilters({...filters, campaignType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPAIGN_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Designer</Label>
                    <Select value={filters.designer} onValueChange={(value) => setFilters({...filters, designer: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All designers" />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGNER_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Layout Type</Label>
                    <Select value={filters.layoutType} onValueChange={(value) => setFilters({...filters, layoutType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All layouts" />
                      </SelectTrigger>
                      <SelectContent>
                        {LAYOUT_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Performance Filters */}
                  <div>
                    <Label>Performance</Label>
                    <Select value={filters.performance} onValueChange={(value) => setFilters({...filters, performance: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All performance" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERFORMANCE_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Max CPC ($)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g. 5.00"
                      value={filters.cpcMax}
                      onChange={(e) => setFilters({...filters, cpcMax: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Max CPL ($)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g. 50.00"
                      value={filters.cplMax}
                      onChange={(e) => setFilters({...filters, cplMax: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="topAds"
                      checked={filters.topAdsOnly}
                      onCheckedChange={(checked) => setFilters({...filters, topAdsOnly: checked as boolean})}
                    />
                    <Label htmlFor="topAds">Top Ads Only</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredCreatives.length} of {mockCreatives.length} creatives
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content Views */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'grid')}>
          <TabsContent value="table">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedCreatives.length === filteredCreatives.length && filteredCreatives.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Creative</TableHead>
                        <TableHead>Litigation/Campaign</TableHead>
                        <TableHead>Designer</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Metrics</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCreatives.map((creative) => (
                        <TableRow key={creative.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCreatives.includes(creative.id)}
                              onCheckedChange={() => handleSelectCreative(creative.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img 
                                src={creative.imageUrl} 
                                alt={creative.filename}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <p className="font-medium text-sm">{creative.filename}</p>
                                <p className="text-xs text-muted-foreground">{creative.layoutType}</p>
                                {creative.markedAsTopAd && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Top Ad
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{creative.litigation}</p>
                              <p className="text-xs text-muted-foreground">{creative.campaignType}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{creative.designer}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getPerformanceColor(creative.performance)}`}>
                              {getPerformanceIcon(creative.performance)}
                              <span className="ml-1 capitalize">{creative.performance}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              <div>Spent: ${creative.amountSpent.toLocaleString()}</div>
                              <div>CPC: ${creative.costPerClick}</div>
                              <div>CPL: ${creative.costPerWebsiteLead}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{creative.dateAdded}</span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedCreativeForPreview(creative)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCreatives.map((creative) => (
                <Card key={creative.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedCreatives.includes(creative.id)}
                      onCheckedChange={() => handleSelectCreative(creative.id)}
                      className="bg-white/80 backdrop-blur-sm border-white"
                    />
                  </div>
                  
                  {creative.markedAsTopAd && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Top Ad
                      </Badge>
                    </div>
                  )}

                  <div className="relative aspect-video">
                    <img 
                      src={creative.imageUrl} 
                      alt={creative.filename}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedCreativeForPreview(creative)}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button variant="secondary" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-sm truncate">{creative.filename}</h3>
                      <p className="text-xs text-muted-foreground">{creative.layoutType} • {creative.designer}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium">{creative.litigation}</p>
                      <p className="text-xs text-muted-foreground">{creative.campaignType}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getPerformanceColor(creative.performance)}`}>
                        {getPerformanceIcon(creative.performance)}
                        <span className="ml-1 capitalize">{creative.performance}</span>
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        CPL: ${creative.costPerWebsiteLead}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {creative.imageryType.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Modal */}
        <Dialog open={!!selectedCreativeForPreview} onOpenChange={() => setSelectedCreativeForPreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCreativeForPreview?.filename}</DialogTitle>
              <DialogDescription>
                {selectedCreativeForPreview?.litigation} • {selectedCreativeForPreview?.designer}
              </DialogDescription>
            </DialogHeader>
            {selectedCreativeForPreview && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedCreativeForPreview.imageUrl}
                    alt={selectedCreativeForPreview.filename}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Campaign Details</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Litigation:</strong> {selectedCreativeForPreview.litigation}</div>
                      <div><strong>Campaign Type:</strong> {selectedCreativeForPreview.campaignType}</div>
                      <div><strong>Layout Type:</strong> {selectedCreativeForPreview.layoutType}</div>
                      <div><strong>Designer:</strong> {selectedCreativeForPreview.designer}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Amount Spent:</strong> ${selectedCreativeForPreview.amountSpent.toLocaleString()}</div>
                      <div><strong>Cost Per Click:</strong> ${selectedCreativeForPreview.costPerClick}</div>
                      <div><strong>Cost Per Lead:</strong> ${selectedCreativeForPreview.costPerWebsiteLead}</div>
                      <div><strong>Performance:</strong> 
                        <Badge className={`ml-2 text-xs ${getPerformanceColor(selectedCreativeForPreview.performance)}`}>
                          {getPerformanceIcon(selectedCreativeForPreview.performance)}
                          <span className="ml-1 capitalize">{selectedCreativeForPreview.performance}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Creative Elements</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Headline:</strong> "{selectedCreativeForPreview.headlineText}"</div>
                      <div><strong>CTA Color:</strong> {selectedCreativeForPreview.ctaColor}</div>
                      <div><strong>CTA Position:</strong> {selectedCreativeForPreview.ctaPosition}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCreativeForPreview.imageryType.map((type: string, index: number) => (
                        <Badge key={`imagery-${index}`} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {selectedCreativeForPreview.copyAngle.map((angle: string, index: number) => (
                        <Badge key={`copy-${index}`} variant="outline" className="text-xs">
                          {angle}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" onClick={() => handleSelectCreative(selectedCreativeForPreview.id)}>
                      {selectedCreatives.includes(selectedCreativeForPreview.id) ? (
                        <>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Select for Analysis
                        </>
                      )}
                    </Button>
                    <Button asChild>
                      <Link href="/upload/single">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Creative
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {filteredCreatives.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || Object.values(filters).some(f => f !== '' && f !== false) 
                  ? 'No creatives match your filters' 
                  : 'No creatives uploaded yet'
                }
              </h2>
              <p className="text-gray-600 mb-6">
                {searchQuery || Object.values(filters).some(f => f !== '' && f !== false)
                  ? 'Try adjusting your search or filters to see more results.'
                  : 'Start by uploading your first creative to see it appear here.'
                }
              </p>
              {searchQuery || Object.values(filters).some(f => f !== '' && f !== false) ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/upload">
                  <Button>Upload Creative</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </PageContainer>
    </ProtectedRoute>
  )
}