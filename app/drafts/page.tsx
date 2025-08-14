"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, User, Play, Trash2, Image, Cloud, CloudOff, RefreshCw } from "lucide-react"
import { DraftStorageV2 } from "@/utils/draftStorage.v2"
import { useFirebaseDrafts } from "@/hooks/useFirebaseDrafts"
import { FirebaseDraftData } from "@/lib/firebase-draft-service"
import { PageContainer, PageHeader } from "@/components/layout/PageContainer"
// Removed unused import - AITag component
import { toast } from "sonner"
import Link from "next/link"
import NextImage from "next/image"

export default function DraftsPage() {
  // Firebase drafts integration with real-time updates
  const {
    drafts: firebaseDrafts,
    isLoading: draftsLoading,
    deleteDraft: deleteFirebaseDraft,
    refreshDrafts,
    isOnline,
    trackingStats,
    error
  } = useFirebaseDrafts({ enableRealTime: true })
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Legacy support for local storage migration
  useEffect(() => {
    // Run legacy migration on first load
    DraftStorageV2.migrateFromV1()
  }, [])

  const handleDeleteDraft = async (draftId: string) => {
    // Find draft for confirmation
    const draft = firebaseDrafts.find(d => d.id === draftId)
    const draftName = draft?.creativeFilename || 'this draft'
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${draftName}"? This action cannot be undone.`)) {
      return
    }
    
    if (!isOnline) {
      toast.error('Cannot delete draft - you are offline')
      return
    }
    
    setIsDeleting(draftId)
    try {
      const success = await deleteFirebaseDraft(draftId)
      if (success) {
        toast.success('Draft deleted successfully')
      } else {
        toast.error('Failed to delete draft')
      }
    } catch (error) {
      console.error('Failed to delete draft:', error)
      toast.error('An error occurred while deleting the draft')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return 'Unknown date'
    }
  }

  const getContinueUrl = (draft: FirebaseDraftData) => {
    // Use Firebase document ID for more reliable draft loading
    const params = new URLSearchParams()
    params.set('resumeId', draft.id || draft.draftId)
    return `/upload/single?${params.toString()}`
  }

  if (draftsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading drafts...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <PageHeader 
            title="Saved Drafts"
            description="Continue working on your saved creative uploads"
          />
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm ${
            isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {isOnline ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
            {isOnline ? 'Connected' : 'Offline'}
          </div>
          
          {/* Tracking Stats */}
          {trackingStats.totalDrafts > 0 && (
            <div className="bg-blue-50 px-3 py-1.5 rounded-full">
              <span className="text-sm text-blue-700">
                {trackingStats.totalDrafts} drafts • {trackingStats.aiPopulatedCount} AI-generated
              </span>
            </div>
          )}
          
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDrafts}
            disabled={!isOnline || draftsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${draftsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <CloudOff className="h-4 w-4" />
              <span className="text-sm">Error loading drafts: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {firebaseDrafts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved drafts yet.</h2>
            <p className="text-gray-600 mb-6">
              Start creating a new creative upload to see your drafts here.
            </p>
            <Link href="/upload/single">
              <Button>Create New Upload</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {firebaseDrafts.map((draft) => (
            <Card key={draft.id || draft.draftId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      {draft.creativeFilename || 'Untitled Draft'}
                      {draft.autoSaved && (
                        <Badge variant="secondary" className="text-xs">Auto-saved</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Last saved: {formatDate(
                          draft.lastSaved?.toDate?.()?.toISOString() || 
                          (typeof draft.lastSaved === 'string' ? draft.lastSaved : new Date().toISOString())
                        )}
                      </div>
                      {draft.formData?.designer && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {draft.formData.designer}
                        </div>
                      )}
                      {isOnline && (
                        <div className="flex items-center gap-1">
                          <Cloud className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 text-xs">Synced</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-xs">
                      ID: {(draft.id || draft.draftId).split('_').pop()}
                    </Badge>
                    {draft.version && (
                      <Badge variant="secondary" className="text-xs">
                        v{draft.version}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Image thumbnail and AI tags */}
                <div className="flex items-start gap-4 mb-6">
                  {/* Image thumbnail */}
                  {(draft.imageUrl || draft.formData?.uploadedImage) && (
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        {draft.imageUrl ? (
                          <NextImage 
                            src={draft.imageUrl} 
                            alt={draft.creativeFilename || 'Draft image'}
                            className="w-full h-full object-cover"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <Image className="w-8 h-8" alt="" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* AI tags */}
                  {draft.aiPopulatedFields && draft.aiPopulatedFields.length > 0 && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">AI Generated Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {draft.aiPopulatedFields.slice(0, 5).map((fieldName, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="text-xs text-gray-600 px-2 py-1 bg-purple-100 rounded">
                              {fieldName}
                            </span>
                            <Badge variant="secondary" className="text-xs px-1 py-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                              AI
                            </Badge>
                          </div>
                        ))}
                        {draft.aiPopulatedFields.length > 5 && (
                          <span className="text-xs text-purple-600">
                            +{draft.aiPopulatedFields.length - 5} more AI fields
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Draft details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Campaign Name</p>
                    <p className="text-sm text-gray-600">
                      {draft.formData?.campaignName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Start Date</p>
                    <p className="text-sm text-gray-600">
                      {draft.formData?.startDate || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">End Date</p>
                    <p className="text-sm text-gray-600">
                      {draft.formData?.endDate || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={getContinueUrl(draft)}>
                      <Button 
                        className="flex items-center gap-2"
                        disabled={!isOnline}
                      >
                        <Play className="w-4 h-4" />
                        Continue
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDraft(draft.id || draft.draftId)}
                      disabled={!isOnline || isDeleting === (draft.id || draft.draftId)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === (draft.id || draft.draftId) ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {isDeleting === (draft.id || draft.draftId) ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(
                      draft.createdAt?.toDate?.()?.toISOString() || 
                      (typeof draft.createdAt === 'string' ? draft.createdAt : new Date().toISOString())
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}