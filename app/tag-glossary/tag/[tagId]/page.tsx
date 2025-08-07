// Individual tag detail page

'use client'

import { useState, useEffect, Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  TrendingUp,
  Image
} from 'lucide-react'
import { useTagGlossary, useTagCreatives } from '@/hooks/useTagGlossary'
import { useTagAudit } from '@/hooks/useTagAudit'
import { usePermissionCheck } from '@/components/admin/TagGlossary/PermissionGuard'
import { formatDate, formatDateTime } from '@/utils/dateHelpers'
import { TagAnalytics } from '@/types/tagGlossary'

// Loading component
function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tag details...</p>
      </div>
    </div>
  )
}

// Error component
function ErrorState({ error }: { error?: string }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tag</h1>
        <p className="text-gray-600 mb-4">{error || 'An error occurred while loading the tag details.'}</p>
        <Link href="/tag-glossary">
          <Button variant="outline">Back to Tag Glossary</Button>
        </Link>
      </div>
    </div>
  )
}

// Main tag detail content component
function TagDetailContent({ tagId }: { tagId: string }) {
  const { getTagById, getTagAnalytics, categories } = useTagGlossary()
  const { getTagHistory } = useTagAudit()
  const { creatives, isLoading: creativesLoading } = useTagCreatives(tagId)
  const permissions = usePermissionCheck()
  
  const [analytics, setAnalytics] = useState<TagAnalytics | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [_error, setError] = useState<string | null>(null)
  
  // Fetch tag data
  const tag = getTagById(tagId)
  const history = getTagHistory(tagId)
  
  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      // console.log('Tag Detail Page - Looking for tag with ID:', tagId)
      // console.log('Tag Detail Page - Found tag:', tag)
      setIsLoading(false)
    }, 100) // Small delay to ensure data is loaded
    
    return () => clearTimeout(timer)
  }, [tagId, tag])
  
  // Load analytics
  useEffect(() => {
    if (tag && !isLoading) {
      setIsLoadingAnalytics(true)
      try {
        const data = getTagAnalytics(tagId)
        setAnalytics(data)
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load analytics:', _error)
        setError('Failed to load analytics')
      } finally {
        setIsLoadingAnalytics(false)
      }
    }
  }, [tag, tagId, getTagAnalytics, isLoading])
  
  // Show loading state
  if (isLoading) {
    return <LoadingState />
  }
  
  // Handle tag not found
  if (!tag) {
    // eslint-disable-next-line no-console
    console.error('Tag Detail Page - Tag not found for ID:', tagId)
    notFound()
  }
  
  const category = categories.find(c => c.id === tag.fieldCategory)
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/tag-glossary" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tag Glossary
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tag.value}</h1>
            <div className="flex items-center gap-3">
              <Badge variant={tag.status === 'approved' ? 'default' : 'secondary'}>
                {tag.status}
              </Badge>
              <span className="text-gray-600">in</span>
              <Link 
                href={`/tag-glossary/${tag.fieldCategory}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {category?.displayName || tag.fieldCategory}
              </Link>
            </div>
          </div>
          
          {permissions.canEdit && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              {permissions.canDelete && (
                <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tag.usageCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unique Creatives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.uniqueCreatives || '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-5 w-5 ${
                analytics?.trendDirection === 'rising' ? 'text-green-600' :
                analytics?.trendDirection === 'declining' ? 'text-red-600' :
                'text-gray-400'
              }`} />
              <span className="text-lg font-medium capitalize">
                {analytics?.trendDirection || '-'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {analytics?.lastUsed ? formatDate(analytics.lastUsed) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="creatives" className="space-y-4">
        <TabsList>
          <TabsTrigger value="creatives">Associated Creatives</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        {/* Creatives Tab */}
        <TabsContent value="creatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Creatives Using This Tag</CardTitle>
              <CardDescription>
                All creatives that have been tagged with &ldquo;{tag.value}&rdquo;
              </CardDescription>
            </CardHeader>
            <CardContent>
              {creativesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading creatives...</p>
                </div>
              ) : creatives.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No creatives found using this tag.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {creatives.map(creative => (
                    <div key={creative.id} className="group cursor-pointer">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                        {creative.thumbnailUrl ? (
                          <img 
                            src={creative.thumbnailUrl} 
                            alt={creative.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{creative.filename}</p>
                      <p className="text-xs text-gray-600">{creative.designer}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Performance and usage patterns for this tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Weekly usage chart would go here */}
                  <div>
                    <h4 className="font-medium mb-2">Weekly Usage Trend</h4>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                      Chart visualization would go here
                    </div>
                  </div>
                  
                  {/* Related tags */}
                  {analytics.relatedTags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Commonly Used With</h4>
                      <div className="flex flex-wrap gap-2">
                        {analytics.relatedTags.map(tagId => (
                          <Badge key={tagId} variant="outline">
                            {tagId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-600">
                  No analytics data available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>
                Audit trail of all changes made to this tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center py-8 text-gray-600">
                  No history available.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map(entry => (
                    <div key={entry.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">
                          {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600">
                          by {entry.userName} • {formatDateTime(entry.timestamp)}
                        </p>
                        {entry.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            Reason: {entry.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tag Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Origin</p>
                  <p className="font-medium capitalize">{tag.origin.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created By</p>
                  <p className="font-medium">{tag.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created Date</p>
                  <p className="font-medium">{formatDate(tag.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Modified</p>
                  <p className="font-medium">{formatDateTime(tag.lastModified)}</p>
                </div>
              </div>
              
              {tag.synonyms && tag.synonyms.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Synonyms</p>
                  <div className="flex flex-wrap gap-2">
                    {tag.synonyms.map((synonym, i) => (
                      <Badge key={i} variant="outline">{synonym}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Wrapper component to handle async params
function TagDetailWrapper({ tagId }: { tagId: string }) {
  // console.log('Tag Detail Wrapper - tagId:', tagId)
  
  if (!tagId) {
    return <ErrorState error="No tag ID provided" />
  }
  
  return (
    <Suspense fallback={<LoadingState />}>
      <TagDetailContent tagId={tagId} />
    </Suspense>
  )
}

// Main page component with simple parameter handling
interface TagDetailPageProps {
  params: Promise<{
    tagId: string
  }>
}

export default function TagDetailPage({ params }: TagDetailPageProps) {
  // For client components with dynamic params, we need to handle the promise differently
  const [tagId, setTagId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Extract the tagId from params
    params
      .then((resolvedParams) => {
        // console.log('Tag Detail Page - Resolved params:', resolvedParams)
        if (resolvedParams?.tagId) {
          setTagId(resolvedParams.tagId)
        } else {
          setError('No tag ID found in parameters')
        }
        setIsLoading(false)
      })
      .catch((_err) => {
        // eslint-disable-next-line no-console
        console.error('Tag Detail Page - Error resolving params:', _err)
        setError('Failed to load page parameters')
        setIsLoading(false)
      })
  }, [params])
  
  if (isLoading) {
    return <LoadingState />
  }
  
  if (error || !tagId) {
    return <ErrorState error={error || 'Tag ID not found'} />
  }
  
  return <TagDetailWrapper tagId={tagId} />
}