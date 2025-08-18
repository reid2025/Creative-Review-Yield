'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  collection, 
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { format } from 'date-fns'
import { toast } from 'sonner'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Icons
import { 
  History,
  Search,
  Download,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  Target,
  Brain,
  FileText,
  ChevronRight,
  MousePointerClick,
  Users,
  DollarSign,
  Hash,
  Lightbulb,
  Sparkles,
  Copy,
  ExternalLink
} from 'lucide-react'

interface Takeaway {
  id: string
  userId: string
  creativeIds: string[]
  creativesCount: number
  litigationTypes: string[]
  campaignTypes: string[]
  userNotes: string
  aiInsights: {
    title: string
    insights: string[]
    recommendations?: string[]
    confidence: number
  }[]
  metrics: {
    avgCPC: string
    avgCPL: string
    totalSpent: string
    topAdPercentage: number
  }
  createdAt: Timestamp
  status: string
}

export default function TakeawayHistoryPage() {
  const { user } = useGoogleAuth()
  const router = useRouter()
  
  // State
  const [takeaways, setTakeaways] = useState<Takeaway[]>([])
  const [filteredTakeaways, setFilteredTakeaways] = useState<Takeaway[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLitigation, setFilterLitigation] = useState('all')
  const [filterCampaign, setFilterCampaign] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedTakeaway, setSelectedTakeaway] = useState<Takeaway | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  
  // Fetch takeaways
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    
    const fetchTakeaways = async () => {
      try {
        console.log('Fetching takeaways for user:', user.uid)
        
        // Start with simplest query - just get all takeaways collection
        const simpleQ = query(
          collection(db, 'takeaways'),
          where('userId', '==', user.uid)
        )
        
        const unsubscribe = onSnapshot(simpleQ, (snapshot) => {
          console.log('Takeaways snapshot received:', snapshot.size, 'documents')
          
          if (snapshot.empty) {
            console.log('No takeaways found for user')
            setTakeaways([])
            setFilteredTakeaways([])
            setLoading(false)
            return
          }
          
          const takeawaysData: Takeaway[] = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            console.log('Document ID:', doc.id)
            console.log('Document data:', data)
            
            takeawaysData.push({
              id: doc.id,
              userId: data.userId || '',
              creativeIds: data.creativeIds || [],
              creativesCount: data.creativesCount || 0,
              litigationTypes: data.litigationTypes || [],
              campaignTypes: data.campaignTypes || [],
              userNotes: data.userNotes || '',
              aiInsights: data.aiInsights || [],
              metrics: data.metrics || {
                avgCPC: '0',
                avgCPL: '0',
                totalSpent: '0',
                topAdPercentage: 0
              },
              createdAt: data.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
              status: data.status || 'active'
            } as Takeaway)
          })
          
          // Sort manually by createdAt
          takeawaysData.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0
            const bTime = b.createdAt?.seconds || 0
            return bTime - aTime
          })
          
          console.log('Processed takeaways:', takeawaysData.length)
          setTakeaways(takeawaysData)
          setFilteredTakeaways(takeawaysData)
          setLoading(false)
        }, (error) => {
          console.error('Error fetching takeaways:', error)
          console.error('Error code:', error.code)
          console.error('Error message:', error.message)
          
          // Try even simpler - get all takeaways without filter
          console.log('Trying to fetch all takeaways without user filter...')
          const allQ = collection(db, 'takeaways')
          
          const allUnsubscribe = onSnapshot(allQ, (snapshot) => {
            console.log('All takeaways snapshot:', snapshot.size, 'documents')
            
            const userTakeaways: Takeaway[] = []
            snapshot.forEach((doc) => {
              const data = doc.data()
              // Filter by userId manually
              if (data.userId === user.uid) {
                console.log('Found user takeaway:', doc.id)
                userTakeaways.push({
                  id: doc.id,
                  userId: data.userId || '',
                  creativeIds: data.creativeIds || [],
                  creativesCount: data.creativesCount || 0,
                  litigationTypes: data.litigationTypes || [],
                  campaignTypes: data.campaignTypes || [],
                  userNotes: data.userNotes || '',
                  aiInsights: data.aiInsights || [],
                  metrics: data.metrics || {
                    avgCPC: '0',
                    avgCPL: '0',
                    totalSpent: '0',
                    topAdPercentage: 0
                  },
                  createdAt: data.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
                  status: data.status || 'active'
                } as Takeaway)
              }
            })
            
            // Sort manually
            userTakeaways.sort((a, b) => {
              const aTime = a.createdAt?.seconds || 0
              const bTime = b.createdAt?.seconds || 0
              return bTime - aTime
            })
            
            console.log('User takeaways found:', userTakeaways.length)
            setTakeaways(userTakeaways)
            setFilteredTakeaways(userTakeaways)
            setLoading(false)
          }, (allError) => {
            console.error('Error fetching all takeaways:', allError)
            toast.error('Failed to load takeaway history')
            setLoading(false)
          })
          
          return allUnsubscribe
        })
        
        return unsubscribe
      } catch (error) {
        console.error('Error setting up query:', error)
        toast.error('Failed to load takeaway history')
        setLoading(false)
      }
    }
    
    let unsubscribeFunc: (() => void) | undefined
    
    fetchTakeaways().then(unsub => {
      if (unsub) {
        unsubscribeFunc = unsub
      }
    })
    
    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc()
      }
    }
  }, [user])
  
  // Filter and sort takeaways
  useEffect(() => {
    let filtered = [...takeaways]
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.userNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.litigationTypes.some(lit => lit.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.campaignTypes.some(camp => camp.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Litigation filter
    if (filterLitigation !== 'all') {
      filtered = filtered.filter(t => t.litigationTypes.includes(filterLitigation))
    }
    
    // Campaign filter
    if (filterCampaign !== 'all') {
      filtered = filtered.filter(t => t.campaignTypes.includes(filterCampaign))
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.seconds - a.createdAt.seconds
        case 'oldest':
          return a.createdAt.seconds - b.createdAt.seconds
        case 'most-creatives':
          return b.creativesCount - a.creativesCount
        case 'least-creatives':
          return a.creativesCount - b.creativesCount
        default:
          return 0
      }
    })
    
    setFilteredTakeaways(filtered)
  }, [takeaways, searchQuery, filterLitigation, filterCampaign, sortBy])
  
  // Get unique filter options
  const litigationOptions = Array.from(new Set(takeaways.flatMap(t => t.litigationTypes)))
  const campaignOptions = Array.from(new Set(takeaways.flatMap(t => t.campaignTypes)))
  
  // Delete takeaway
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'takeaways', id))
      toast.success('Takeaway deleted')
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Error deleting takeaway:', error)
      toast.error('Failed to delete takeaway')
    }
  }
  
  // Export takeaway as JSON
  const exportTakeaway = (takeaway: Takeaway) => {
    const dataStr = JSON.stringify(takeaway, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `takeaway_${format(takeaway.createdAt.toDate(), 'yyyy-MM-dd_HHmm')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Takeaway exported')
  }
  
  // Copy insights to clipboard
  const copyInsights = (takeaway: Takeaway) => {
    const insights = takeaway.aiInsights.map(section => 
      `${section.title}\n${section.insights.join('\n')}\n${section.recommendations ? section.recommendations.join('\n') : ''}`
    ).join('\n\n')
    
    navigator.clipboard.writeText(insights)
    toast.success('Insights copied to clipboard')
  }
  
  // View in Strategy Sync
  const viewInStrategySync = (takeaway: Takeaway) => {
    const creativeIdsParam = takeaway.creativeIds.join(',')
    router.push(`/strategy-sync?creatives=${creativeIdsParam}`)
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <History className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold">Takeaway History</h1>
        </div>
        <p className="text-gray-600">
          Review your saved strategy analysis takeaways and insights
        </p>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search takeaways..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Litigation Filter */}
            <Select value={filterLitigation} onValueChange={setFilterLitigation}>
              <SelectTrigger>
                <SelectValue placeholder="All Litigations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Litigations</SelectItem>
                {litigationOptions.map(lit => (
                  <SelectItem key={lit} value={lit}>{lit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Campaign Filter */}
            <Select value={filterCampaign} onValueChange={setFilterCampaign}>
              <SelectTrigger>
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaignOptions.map(camp => (
                  <SelectItem key={camp} value={camp}>{camp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most-creatives">Most Creatives</SelectItem>
                <SelectItem value="least-creatives">Least Creatives</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Takeaways</p>
                <p className="text-2xl font-bold">{takeaways.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Creatives Analyzed</p>
                <p className="text-2xl font-bold">
                  {takeaways.reduce((sum, t) => sum + t.creativesCount, 0)}
                </p>
              </div>
              <Hash className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Insights</p>
                <p className="text-2xl font-bold">
                  {takeaways.length > 0 
                    ? Math.round(takeaways.reduce((sum, t) => 
                        sum + t.aiInsights.reduce((s, i) => s + i.insights.length, 0), 0
                      ) / takeaways.length)
                    : 0}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {takeaways.filter(t => {
                    const date = t.createdAt.toDate()
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && 
                           date.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Takeaways Grid */}
      {filteredTakeaways.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No takeaways found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterLitigation !== 'all' || filterCampaign !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first strategy analysis to save takeaways'}
            </p>
            {!searchQuery && filterLitigation === 'all' && filterCampaign === 'all' && (
              <Button onClick={() => router.push('/creatives')}>
                Go to Creatives
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTakeaways.map((takeaway) => (
            <Card key={takeaway.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {format(takeaway.createdAt.toDate(), 'MMM d, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {format(takeaway.createdAt.toDate(), 'h:mm a')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {takeaway.creativesCount} Creatives
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <MousePointerClick className="h-3 w-3 text-blue-500" />
                    <span className="text-gray-600">CPC:</span>
                    <span className="font-medium">${takeaway.metrics.avgCPC}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-500" />
                    <span className="text-gray-600">CPL:</span>
                    <span className="font-medium">${takeaway.metrics.avgCPL}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-purple-500" />
                    <span className="text-gray-600">Spent:</span>
                    <span className="font-medium">${takeaway.metrics.totalSpent}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-yellow-500" />
                    <span className="text-gray-600">Top:</span>
                    <span className="font-medium">{takeaway.metrics.topAdPercentage}%</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="space-y-2">
                  {takeaway.litigationTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {takeaway.litigationTypes.slice(0, 2).map(lit => (
                        <Badge key={lit} variant="outline" className="text-xs">
                          {lit}
                        </Badge>
                      ))}
                      {takeaway.litigationTypes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{takeaway.litigationTypes.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {/* User Notes Preview */}
                {takeaway.userNotes && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {takeaway.userNotes}
                  </p>
                )}
                
                {/* Insights Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Brain className="h-4 w-4" />
                  <span>
                    {takeaway.aiInsights.reduce((sum, s) => sum + s.insights.length, 0)} insights
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      setSelectedTakeaway(takeaway)
                      setViewDetailsOpen(true)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewInStrategySync(takeaway)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportTakeaway(takeaway)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirmId(takeaway.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Takeaway Details</DialogTitle>
            <DialogDescription>
              {selectedTakeaway && format(selectedTakeaway.createdAt.toDate(), 'MMMM d, yyyy at h:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTakeaway && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Metrics Overview */}
                <div>
                  <h3 className="font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Avg CPC</p>
                      <p className="text-lg font-bold">${selectedTakeaway.metrics.avgCPC}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Avg CPL</p>
                      <p className="text-lg font-bold">${selectedTakeaway.metrics.avgCPL}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Total Spent</p>
                      <p className="text-lg font-bold">${selectedTakeaway.metrics.totalSpent}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Top Ads</p>
                      <p className="text-lg font-bold">{selectedTakeaway.metrics.topAdPercentage}%</p>
                    </div>
                  </div>
                </div>
                
                {/* Context */}
                <div>
                  <h3 className="font-semibold mb-3">Analysis Context</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Creatives:</span>
                      <Badge>{selectedTakeaway.creativesCount}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Litigations:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedTakeaway.litigationTypes.map(lit => (
                          <Badge key={lit} variant="outline">{lit}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Campaigns:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedTakeaway.campaignTypes.map(camp => (
                          <Badge key={camp} variant="secondary">{camp}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* User Notes */}
                {selectedTakeaway.userNotes && (
                  <div>
                    <h3 className="font-semibold mb-3">Your Notes</h3>
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm whitespace-pre-wrap">{selectedTakeaway.userNotes}</p>
                    </div>
                  </div>
                )}
                
                {/* AI Insights */}
                <div>
                  <h3 className="font-semibold mb-3">AI Analysis Insights</h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {selectedTakeaway.aiInsights.map((section, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            {section.title === 'Pattern Recognition' && <Brain className="h-4 w-4" />}
                            {section.title === 'Performance Analysis' && <TrendingUp className="h-4 w-4" />}
                            {section.title === 'Litigation-Specific Insights' && <Target className="h-4 w-4" />}
                            {section.title === 'Cross-Campaign Opportunities' && <Lightbulb className="h-4 w-4" />}
                            {section.title === 'Optimization Recommendations' && <Sparkles className="h-4 w-4" />}
                            <span>{section.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {Math.round(section.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pl-6">
                            {section.insights.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Insights:</p>
                                <ul className="space-y-1">
                                  {section.insights.map((insight, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                      <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {section.recommendations && section.recommendations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Recommendations:</p>
                                <ul className="space-y-1">
                                  {section.recommendations.map((rec, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                      <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedTakeaway && copyInsights(selectedTakeaway)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Insights
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedTakeaway && viewInStrategySync(selectedTakeaway)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Strategy Sync
            </Button>
            <Button onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Takeaway?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your takeaway and all associated insights.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}