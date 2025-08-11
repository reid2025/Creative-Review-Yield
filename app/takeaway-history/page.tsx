'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  TrendingUp, 
  MessageSquare, 
  Eye, 
  Download, 
  Star, 
  StarOff,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Brain,
  Sparkles,
  FileText,
  BarChart3,
  Archive,
  Trash2,
  Share2,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'

// Mock takeaway data - in production, this would come from Firebase/API
const mockTakeaways = [
  {
    id: 'takeaway_1',
    title: 'Q1 Campaign Analysis - Blue CTAs & Question Headlines',
    description: 'Analysis revealed that blue CTAs outperform red by 31% and question-based headlines improve conversion by 28%.',
    createdAt: '2025-08-05T14:30:00Z',
    createdBy: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: '/placeholder-user.jpg'
    },
    creativesCount: 3,
    campaignTypes: ['Mass Tort', 'SA (Sexual Abuse)', 'Personal Injury'],
    litigations: ['Ozempic Campaign', 'LA County SA', 'Wage Claim Campaign'],
    status: 'completed',
    implementationStatus: 'in_progress',
    isFavorited: true,
    commentsCount: 5,
    viewsCount: 23,
    tags: ['Q1', 'CTA Analysis', 'High Priority'],
    performanceImpact: 'high',
    aiInsightsPreview: [
      'Blue CTAs appear 67% more in high-performing creatives',
      'Question headlines: 22% better performance than statements',
      'Empathetic tone correlates with 35% higher conversion'
    ],
    userTakeaways: 'Key insight: Blue CTAs consistently outperform across all campaign types. Recommend A/B testing question headlines in all new campaigns. Implementation priority: High.',
    lastActivity: '2025-08-06T09:15:00Z'
  },
  {
    id: 'takeaway_2',
    title: 'SA Campaign Messaging Strategy Analysis',
    description: 'Deep dive into empathetic messaging and professional tone effectiveness in SA campaigns.',
    createdAt: '2025-08-03T11:45:00Z',
    createdBy: {
      id: 'user2',
      name: 'Mike Chen',
      avatar: '/placeholder-user.jpg'
    },
    creativesCount: 5,
    campaignTypes: ['SA (Sexual Abuse)'],
    litigations: ['LA County SA', 'IL Juvie SA', 'FL Adult SA'],
    status: 'completed',
    implementationStatus: 'completed',
    isFavorited: false,
    commentsCount: 12,
    viewsCount: 45,
    tags: ['SA Campaigns', 'Messaging', 'Empathy'],
    performanceImpact: 'high',
    aiInsightsPreview: [
      'Empathetic tone correlates with 35% higher conversion in SA campaigns',
      'Professional language works better than casual in legal contexts',
      'Soft color palettes (blues) increase engagement by 35%'
    ],
    userTakeaways: 'Empathetic messaging is crucial for SA campaigns. Blue color schemes build trust. Need to maintain professional tone while being supportive.',
    lastActivity: '2025-08-07T16:22:00Z'
  },
  {
    id: 'takeaway_3',
    title: 'Mobile Optimization Insights - Carousel Performance',
    description: 'Analysis of carousel layouts and their mobile performance across different campaign types.',
    createdAt: '2025-08-01T16:20:00Z',
    createdBy: {
      id: 'user3',
      name: 'Lisa Rodriguez',
      avatar: '/placeholder-user.jpg'
    },
    creativesCount: 8,
    campaignTypes: ['Personal Injury', 'Mass Tort'],
    litigations: ['Car Accident - Miami', 'Roundup Litigation', 'Wage Claim Campaign'],
    status: 'completed',
    implementationStatus: 'not_started',
    isFavorited: true,
    commentsCount: 3,
    viewsCount: 18,
    tags: ['Mobile', 'Carousel', 'Performance'],
    performanceImpact: 'medium',
    aiInsightsPreview: [
      'Carousel layouts show 40% better engagement on mobile',
      'Enhanced mobile responsiveness could increase conversions by 25%',
      'Mobile CTA placement critical for conversion optimization'
    ],
    userTakeaways: 'Carousel format works well on mobile. Need to prioritize mobile optimization across all campaigns. Consider mobile-first design approach.',
    lastActivity: '2025-08-02T10:30:00Z'
  },
  {
    id: 'takeaway_4',
    title: 'Legal Industry Color Psychology Study',
    description: 'Comprehensive analysis of color choices and their impact on legal marketing performance.',
    createdAt: '2025-07-28T09:15:00Z',
    createdBy: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: '/placeholder-user.jpg'
    },
    creativesCount: 12,
    campaignTypes: ['Personal Injury', 'Mass Tort', 'SA (Sexual Abuse)'],
    litigations: ['Multiple campaigns'],
    status: 'completed',
    implementationStatus: 'in_progress',
    isFavorited: false,
    commentsCount: 8,
    viewsCount: 67,
    tags: ['Color Psychology', 'Legal Marketing', 'Research'],
    performanceImpact: 'high',
    aiInsightsPreview: [
      'Blue color scheme: 31% better performance in legal campaigns',
      'Color psychology: Blues convey trust, orange creates urgency',
      'Red CTAs outperform blue by 15% in Personal Injury campaigns'
    ],
    userTakeaways: 'Color choice significantly impacts performance in legal marketing. Blue builds trust for SA campaigns, but red may work better for Personal Injury. Need more testing.',
    lastActivity: '2025-07-30T14:45:00Z'
  }
]

// Mock comments data
const mockComments = [
  {
    id: 'comment_1',
    takeawayId: 'takeaway_1',
    author: { name: 'Mike Chen', avatar: '/placeholder-user.jpg' },
    content: 'Great insights! We should implement the blue CTA recommendation across all our current campaigns.',
    createdAt: '2025-08-06T09:15:00Z',
    replies: [
      {
        id: 'reply_1',
        author: { name: 'Sarah Johnson', avatar: '/placeholder-user.jpg' },
        content: 'Agreed! I\'m already seeing improved performance in our test campaigns.',
        createdAt: '2025-08-06T10:30:00Z'
      }
    ]
  }
]

type ViewMode = 'timeline' | 'campaign' | 'performance'
type StatusFilter = 'all' | 'completed' | 'in_progress' | 'not_started'
type ImpactFilter = 'all' | 'high' | 'medium' | 'low'

export default function TakeawayHistoryPage() {
  const { user } = useAuth()
  
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('all')
  const [creatorFilter, setCreatorFilter] = useState('')
  const [selectedTakeaway, setSelectedTakeaway] = useState<any>(null)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [favorites, setFavorites] = useState(new Set(mockTakeaways.filter(t => t.isFavorited).map(t => t.id)))

  // Filter takeaways
  const filteredTakeaways = mockTakeaways.filter(takeaway => {
    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        takeaway.title.toLowerCase().includes(searchLower) ||
        takeaway.description.toLowerCase().includes(searchLower) ||
        takeaway.userTakeaways.toLowerCase().includes(searchLower) ||
        takeaway.tags.some(tag => tag.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter !== 'all' && takeaway.implementationStatus !== statusFilter) return false

    // Impact filter
    if (impactFilter !== 'all' && takeaway.performanceImpact !== impactFilter) return false

    // Creator filter
    if (creatorFilter && takeaway.createdBy.name !== creatorFilter) return false

    return true
  }).sort((a, b) => {
    if (viewMode === 'timeline') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (viewMode === 'performance') {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.performanceImpact as keyof typeof impactOrder] - 
             impactOrder[a.performanceImpact as keyof typeof impactOrder]
    }
    return 0
  })

  const toggleFavorite = useCallback((takeawayId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(takeawayId)) {
        newFavorites.delete(takeawayId)
        toast.info('Removed from favorites')
      } else {
        newFavorites.add(takeawayId)
        toast.success('Added to favorites')
      }
      return newFavorites
    })
  }, [])

  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    toast.success('Comment added successfully')
    setNewComment('')
    // In production, this would save to Firebase
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'not_started': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'in_progress': return <Clock className="h-3 w-3" />
      case 'not_started': return <AlertCircle className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const exportTakeaways = () => {
    toast.info('Export functionality coming soon!')
  }

  const uniqueCreators = [...new Set(mockTakeaways.map(t => t.createdBy.name))]

  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader 
          title="Takeaway History"
          description="View and manage your strategic insights and takeaways"
        />

        {/* Controls and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search takeaways, insights, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-80"
                />
              </div>

              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="timeline" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Timeline</span>
                  </TabsTrigger>
                  <TabsTrigger value="campaign" className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Campaign</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Performance</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportTakeaways}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button asChild>
                <Link href="/strategy-sync">
                  <Sparkles className="h-4 w-4 mr-2" />
                  New Analysis
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Implementation Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Impact Level</Label>
                  <Select value={impactFilter} onValueChange={(value) => setImpactFilter(value as ImpactFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All impacts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Impacts</SelectItem>
                      <SelectItem value="high">High Impact</SelectItem>
                      <SelectItem value="medium">Medium Impact</SelectItem>
                      <SelectItem value="low">Low Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Creator</Label>
                  <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All creators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Creators</SelectItem>
                      {uniqueCreators.map(creator => (
                        <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setImpactFilter('all')
                      setCreatorFilter('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredTakeaways.length} of {mockTakeaways.length} takeaways
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Takeaways List */}
        <div className="space-y-4">
          {filteredTakeaways.map(takeaway => (
            <Card key={takeaway.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer"
                              onClick={() => setSelectedTakeaway(takeaway)}>
                            {takeaway.title}
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleFavorite(takeaway.id)}
                          >
                            {favorites.has(takeaway.id) ? 
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : 
                              <StarOff className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                        <p className="text-muted-foreground mt-1">{takeaway.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getImpactColor(takeaway.performanceImpact)} text-xs`}>
                          {takeaway.performanceImpact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={takeaway.createdBy.avatar} />
                          <AvatarFallback>{takeaway.createdBy.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{takeaway.createdBy.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(takeaway.createdAt), 'MMM d, yyyy')}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Brain className="h-4 w-4" />
                        <span>{takeaway.creativesCount} creatives</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{takeaway.commentsCount} comments</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{takeaway.viewsCount} views</span>
                      </div>
                    </div>

                    {/* Status and Tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={`text-xs ${getStatusColor(takeaway.implementationStatus)}`}>
                          {getStatusIcon(takeaway.implementationStatus)}
                          <span className="ml-1 capitalize">{takeaway.implementationStatus.replace('_', ' ')}</span>
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          {takeaway.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {takeaway.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{takeaway.tags.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTakeaway(takeaway)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedTakeaway(takeaway)
                            setShowComments(true)
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comments
                        </Button>
                      </div>
                    </div>

                    {/* Quick Preview */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-2">Key AI Insights:</p>
                      <ul className="text-sm space-y-1">
                        {takeaway.aiInsightsPreview.slice(0, 2).map((insight, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-muted-foreground">{insight}</span>
                          </li>
                        ))}
                      </ul>
                      {takeaway.userTakeaways && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm"><strong>Your Takeaways:</strong> {takeaway.userTakeaways.substring(0, 150)}...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTakeaways.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' || impactFilter !== 'all' || creatorFilter
                  ? 'No takeaways match your filters'
                  : 'No takeaways yet'
                }
              </h2>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || impactFilter !== 'all' || creatorFilter
                  ? 'Try adjusting your search or filters to see more results.'
                  : 'Your strategic insights and takeaways will appear here once you start analyzing campaigns.'
                }
              </p>
              <Link href="/strategy-sync">
                <Button>Create Your First Analysis</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Takeaway Details Modal */}
        <Dialog open={!!selectedTakeaway} onOpenChange={() => setSelectedTakeaway(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedTakeaway?.title}</span>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getImpactColor(selectedTakeaway?.performanceImpact || 'low')}`}>
                    {selectedTakeaway?.performanceImpact?.toUpperCase()} IMPACT
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => selectedTakeaway && toggleFavorite(selectedTakeaway.id)}
                  >
                    {selectedTakeaway && favorites.has(selectedTakeaway.id) ? 
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : 
                      <StarOff className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription>
                Created by {selectedTakeaway?.createdBy.name} • {selectedTakeaway?.creativesCount} creatives analyzed
              </DialogDescription>
            </DialogHeader>

            {selectedTakeaway && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Created:</p>
                      <p className="text-muted-foreground">{format(new Date(selectedTakeaway.createdAt), 'PPpp')}</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Activity:</p>
                      <p className="text-muted-foreground">{formatDistanceToNow(new Date(selectedTakeaway.lastActivity))} ago</p>
                    </div>
                    <div>
                      <p className="font-medium">Campaign Types:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTakeaway.campaignTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Implementation:</p>
                      <Badge className={`text-xs mt-1 ${getStatusColor(selectedTakeaway.implementationStatus)}`}>
                        {getStatusIcon(selectedTakeaway.implementationStatus)}
                        <span className="ml-1 capitalize">{selectedTakeaway.implementationStatus.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* AI Insights Preview */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      Key AI Insights
                    </h4>
                    <div className="space-y-2">
                      {selectedTakeaway.aiInsightsPreview.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* User Takeaways */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Strategic Takeaways
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedTakeaway.userTakeaways}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTakeaway.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Comments Section */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments ({selectedTakeaway.commentsCount})
                    </h4>
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <Button onClick={handleAddComment} size="sm" className="mt-2">
                            Add Comment
                          </Button>
                        </div>
                      </div>
                      
                      {/* Sample comments */}
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>MC</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm"><strong>Mike Chen</strong></p>
                              <p className="text-sm text-muted-foreground">Great insights! We should implement the blue CTA recommendation across all our current campaigns.</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTakeaway(null)}>
                Close
              </Button>
              <Button onClick={() => toast.info('Edit functionality coming soon!')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Takeaway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </ProtectedRoute>
  )
}