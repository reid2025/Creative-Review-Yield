'use client'

import { useState, useMemo } from 'react'
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
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Users,
  Target,
  Hash,
  AlertCircle,
  CheckCircle,
  Star,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Mock data for tag analytics - in production, this would come from Firebase/API
const mockTagCategories = [
  {
    id: 'cta-verb',
    name: 'CTA Verb',
    description: 'Action words used in call-to-action buttons',
    tags: [
      { name: 'Get', usage: 45, performance: 'high', trend: 'up', avgCPL: 24.50, conversions: 234 },
      { name: 'Start', usage: 32, performance: 'high', trend: 'up', avgCPL: 26.20, conversions: 187 },
      { name: 'Learn', usage: 28, performance: 'medium', trend: 'stable', avgCPL: 35.40, conversions: 145 },
      { name: 'Discover', usage: 19, performance: 'medium', trend: 'down', avgCPL: 42.10, conversions: 98 },
      { name: 'Call', usage: 15, performance: 'low', trend: 'down', avgCPL: 58.30, conversions: 67 }
    ]
  },
  {
    id: 'copy-angle',
    name: 'Copy Angle',
    description: 'Marketing messaging approaches and strategies',
    tags: [
      { name: 'Legal', usage: 67, performance: 'high', trend: 'up', avgCPL: 22.80, conversions: 342 },
      { name: 'Educational', usage: 54, performance: 'high', trend: 'up', avgCPL: 28.90, conversions: 256 },
      { name: 'Urgency', usage: 43, performance: 'medium', trend: 'stable', avgCPL: 31.20, conversions: 198 },
      { name: 'Benefit-focused', usage: 38, performance: 'medium', trend: 'up', avgCPL: 33.70, conversions: 176 },
      { name: 'Question-based', usage: 29, performance: 'high', trend: 'up', avgCPL: 25.10, conversions: 234 }
    ]
  },
  {
    id: 'copy-tone',
    name: 'Copy Tone',
    description: 'Emotional and stylistic tone of messaging',
    tags: [
      { name: 'Professional', usage: 89, performance: 'high', trend: 'stable', avgCPL: 27.40, conversions: 456 },
      { name: 'Empathetic', usage: 76, performance: 'high', trend: 'up', avgCPL: 24.60, conversions: 389 },
      { name: 'Urgent', usage: 52, performance: 'medium', trend: 'down', avgCPL: 38.20, conversions: 234 },
      { name: 'Conversational', usage: 34, performance: 'medium', trend: 'stable', avgCPL: 41.80, conversions: 167 },
      { name: 'Authoritative', usage: 27, performance: 'low', trend: 'down', avgCPL: 55.90, conversions: 123 }
    ]
  },
  {
    id: 'campaign-type',
    name: 'Campaign Type',
    description: 'Legal practice area classifications',
    tags: [
      { name: 'Mass Tort', usage: 95, performance: 'high', trend: 'up', avgCPL: 29.80, conversions: 567 },
      { name: 'Personal Injury', usage: 78, performance: 'high', trend: 'stable', avgCPL: 32.40, conversions: 445 },
      { name: 'SA (Sexual Abuse)', usage: 45, performance: 'high', trend: 'up', avgCPL: 18.90, conversions: 289 },
      { name: 'Workers Compensation', usage: 23, performance: 'medium', trend: 'stable', avgCPL: 45.20, conversions: 134 }
    ]
  },
  {
    id: 'imagery-type',
    name: 'Imagery Type',
    description: 'Visual content categories and styles',
    tags: [
      { name: 'Photos', usage: 123, performance: 'high', trend: 'stable', avgCPL: 30.50, conversions: 678 },
      { name: 'Illustrations', usage: 67, performance: 'high', trend: 'up', avgCPL: 25.80, conversions: 345 },
      { name: 'Graphics', usage: 54, performance: 'medium', trend: 'stable', avgCPL: 35.90, conversions: 234 },
      { name: 'Icons', usage: 43, performance: 'medium', trend: 'up', avgCPL: 38.40, conversions: 198 },
      { name: 'Video', usage: 12, performance: 'low', trend: 'down', avgCPL: 65.20, conversions: 67 }
    ]
  }
]

const litigationOptions = [
  'All Litigations',
  'Ozempic Campaign',
  'LA County SA', 
  'Car Accident - Miami',
  'Roundup Litigation',
  'Wage Claim Campaign'
]

const performanceFilters = ['All Performance', 'High', 'Medium', 'Low']
const trendFilters = ['All Trends', 'Up', 'Stable', 'Down']

export function TagGlossary() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLitigation, setSelectedLitigation] = useState('All Litigations')
  const [performanceFilter, setPerformanceFilter] = useState('All Performance')
  const [trendFilter, setTrendFilter] = useState('All Trends')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedTag, setSelectedTag] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)

  // Filter tags based on search and filters
  const filteredCategories = useMemo(() => {
    return mockTagCategories.map(category => ({
      ...category,
      tags: category.tags.filter(tag => {
        // Search filter
        if (searchQuery && !tag.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
        // Performance filter
        if (performanceFilter !== 'All Performance' && tag.performance !== performanceFilter.toLowerCase()) {
          return false
        }
        // Trend filter
        if (trendFilter !== 'All Trends' && tag.trend !== trendFilter.toLowerCase()) {
          return false
        }
        return true
      })
    })).filter(category => 
      activeCategory === 'all' || category.id === activeCategory
    )
  }, [searchQuery, performanceFilter, trendFilter, activeCategory])

  // Get all tags for overview
  const allTags = useMemo(() => {
    return mockTagCategories.flatMap(category => 
      category.tags.map(tag => ({ ...tag, category: category.name }))
    )
  }, [])

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
      case 'medium': return <BarChart3 className="h-3 w-3" />
      case 'low': return <TrendingDown className="h-3 w-3" />
      default: return null
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />
      case 'stable': return <BarChart3 className="h-3 w-3 text-gray-500" />
      default: return null
    }
  }

  const handleAddTag = () => {
    // In production, this would add to Firebase
    toast.success('Tag added successfully!')
    setShowAddModal(false)
  }

  const handleEditTag = () => {
    // In production, this would update Firebase
    toast.success('Tag updated successfully!')
    setShowEditModal(false)
    setEditingTag(null)
  }

  const handleDeleteTag = (tag: any) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`)) {
      return
    }
    // In production, this would delete from Firebase
    toast.success('Tag deleted successfully!')
  }

  const exportTags = () => {
    toast.info('Export functionality coming soon!')
  }

  // Calculate overview statistics
  const overviewStats = {
    totalTags: allTags.length,
    highPerforming: allTags.filter(tag => tag.performance === 'high').length,
    totalUsage: allTags.reduce((sum, tag) => sum + tag.usage, 0),
    avgCPL: allTags.reduce((sum, tag) => sum + tag.avgCPL, 0) / allTags.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tag Glossary</h1>
          <p className="text-muted-foreground">Manage and analyze your creative tags across all campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportTags}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{overviewStats.totalTags}</p>
                  <p className="text-xs text-muted-foreground">Total Tags</p>
                </div>
                <Hash className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{overviewStats.highPerforming}</p>
                  <p className="text-xs text-muted-foreground">High Performers</p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{overviewStats.totalUsage.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Usage</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">${overviewStats.avgCPL.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Avg CPL</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {mockTagCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Performance</Label>
                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {performanceFilters.map(filter => (
                      <SelectItem key={filter} value={filter}>
                        {filter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Trend</Label>
                <Select value={trendFilter} onValueChange={setTrendFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trendFilters.map(filter => (
                      <SelectItem key={filter} value={filter}>
                        {filter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('all')
                    setPerformanceFilter('All Performance')
                    setTrendFilter('All Trends')
                    setSelectedLitigation('All Litigations')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tag Categories */}
      <div className="space-y-6">
        {filteredCategories.map(category => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                </div>
                <Badge variant="secondary">
                  {category.tags.length} tags
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tags.map(tag => (
                  <Card key={tag.name} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{tag.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Used in {tag.usage} creatives
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getPerformanceColor(tag.performance)}`}>
                            {getPerformanceIcon(tag.performance)}
                            <span className="ml-1 capitalize">{tag.performance}</span>
                          </Badge>
                          {getTrendIcon(tag.trend)}
                        </div>
                      </div>
                      
                      {showAnalytics && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Avg CPL:</span>
                            <span>${tag.avgCPL}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Conversions:</span>
                            <span>{tag.conversions}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedTag(tag)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingTag(tag)
                              setShowEditModal(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteTag(tag)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Tag Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag for your creative glossary
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockTagCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tag Name</Label>
              <Input placeholder="Enter tag name" />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Textarea placeholder="Describe when to use this tag" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Modify tag details
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4">
              <div>
                <Label>Tag Name</Label>
                <Input defaultValue={editingTag.name} />
              </div>
              <div>
                <Label>Performance Notes</Label>
                <Textarea placeholder="Add performance notes or optimization suggestions" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTag}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Details Modal */}
      <Dialog open={!!selectedTag} onOpenChange={() => setSelectedTag(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTag?.name} Tag Details</DialogTitle>
            <DialogDescription>
              Performance analytics and usage information
            </DialogDescription>
          </DialogHeader>
          {selectedTag && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Usage Statistics</p>
                  <p className="text-sm text-muted-foreground">Used in {selectedTag.usage} creatives</p>
                </div>
                <div>
                  <p className="font-medium">Performance</p>
                  <Badge className={`text-xs ${getPerformanceColor(selectedTag.performance)}`}>
                    {getPerformanceIcon(selectedTag.performance)}
                    <span className="ml-1 capitalize">{selectedTag.performance}</span>
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Average CPL</p>
                  <p className="text-2xl font-bold">${selectedTag.avgCPL}</p>
                </div>
                <div>
                  <p className="font-medium">Total Conversions</p>
                  <p className="text-2xl font-bold">{selectedTag.conversions}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button asChild>
                  <Link href={`/creatives?tag=${selectedTag.name}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Creatives Using This Tag
                  </Link>
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Detailed Analytics
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}